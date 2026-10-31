import WebSocket from 'ws';

/** Small CDP driver used by the external shutdown smoke tests. */
export default class DevToolsDriver {
    #serial = 0;
    #replies = new Map();

    constructor(socket) {
        this.socket = socket;
        this.errors = [];
        socket.on('message', data => {
            const message = JSON.parse(data);
            if (process.env.DEBUG_EXIT) console.log('CDP received', message);
            if (message.id) {
                const reply = this.#replies.get(message.id);
                if (!reply) return;
                this.#replies.delete(message.id);
                clearTimeout(reply.timer);
                if (message.error) reply.reject(new Error(JSON.stringify(message.error)));
                else reply.resolve(message.result);
            } else if (message.method === 'Runtime.exceptionThrown') {
                this.errors.push(message.params.exceptionDetails);
            }
        });
        socket.on('close', () => {
            for (const reply of this.#replies.values()) {
                clearTimeout(reply.timer);
                reply.reject(new Error('DevTools connection closed.'));
            }
            this.#replies.clear();
        });
    }

    static async connect(url) {
        const socket = new WebSocket(url);
        await new Promise((resolve, reject) => {
            socket.once('open', resolve);
            socket.once('error', reject);
        });
        return new DevToolsDriver(socket);
    }

    send(method, params = {}, sessionId) {
        return new Promise((resolve, reject) => {
            const id = ++this.#serial;
            const timer = setTimeout(() => {
                this.#replies.delete(id);
                reject(new Error(`DevTools command timed out: ${method}`));
            }, 10000);
            this.#replies.set(id, { resolve, reject, timer });
            if (process.env.DEBUG_EXIT)
                console.log('CDP send', { id, method, params, sessionId });
            this.socket.send(JSON.stringify({ id, method, params, sessionId }));
        });
    }

    async attach(urlPart = 'cm-app://app/') {
        const { targetInfos } = await this.send('Target.getTargets');
        const target = targetInfos.find(info => info.type === 'page'
            && info.url.includes(urlPart));
        if (!target) return false;
        const result = await this.send('Target.attachToTarget', {
            targetId: target.targetId, flatten: true
        });
        this.session = result.sessionId;
        await this.send('Runtime.enable', {}, this.session);
        return true;
    }

    async evaluate(expression) {
        const result = await this.send('Runtime.evaluate', {
            expression, returnByValue: true, awaitPromise: true
        }, this.session);
        if (result.exceptionDetails)
            throw new Error(JSON.stringify(result.exceptionDetails));
        return result.result?.value;
    }

    closePage() {
        return this.send('Page.close', {}, this.session);
    }

    disconnect() {
        this.socket.close();
    }
}
