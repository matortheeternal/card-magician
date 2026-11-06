const L = localize('extensions');

export default class ExtensionAction {
    static matches(action) {
        return action === this.action;
    }

    constructor(context) {
        Object.assign(this, context);
    }

    async execute() {
        await this.prepare();
        if (!await this.confirm()) return false;
        await this.apply();
        return true;
    }

    get completion() {
        return { message: L`Extension changes saved.`, error: false };
    }

    async prepare() {}

    get confirmation() {
        return null;
    }

    async confirm() {
        const confirmation = this.confirmation;
        if (!confirmation) return true;
        return dialog.confirm(confirmation.message, confirmation.options);
    }

    async apply() {
        throw new Error('Not implemented.');
    }
}
