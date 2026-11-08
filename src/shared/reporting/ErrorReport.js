export default class ErrorReport {
    constructor(errors) {
        this.errors = Array.from(errors);
    }

    errorsToMarkdown() {
        if (!this.errors.length)
            return ['No errors are currently visible in the application.'];
        return this.errors.map((error, n) => this.errorInformation(error, n + 1));
    }

    toMarkdown() {
        const sections = [
            '# Card Magician Error Report',
            `Generated: ${new Date().toISOString()}`,
            this.renderSystemInformation(),
            `## Errors (${this.errors.length})`,
        ];

        sections.push(...this.errorsToMarkdown());
        return sections.join('\n\n');
    }

    get systemInfo() {
        return {
            'Application ID': globalThis.appEnvironment?.id,
            'Electron version': globalThis.appEnvironment?.runtimeVersion,
            'Resource mode': globalThis.appEnvironment?.resourceMode,
            'Platform': navigator.userAgentData?.platform || navigator.platform,
            'Language': navigator.language,
            'User agent': navigator.userAgent
        };
    }

    renderSystemInformation() {
        return [
            `## System Information`,
            ...Object.entries(this.systemInfo).map(([key, value]) => {
                return `- ${key}: ${this.inline(value)}`;
            }),
        ].join('\n');
    }

    errorInformation(error, number) {
        const context = error.context ?? {};
        const label = context.label ?? `unit ${context.unit ?? 'unknown'}`;
        const message = error.error?.message ?? String(error.error);
        const sections = [
            `### Error ${number}: ${label}`,
            `- ID: ${this.inline(error.id)}`,
            `- Reported: ${this.timestamp(error.timestamp)}`,
            `#### Message\n${this.codeBlock(message)}`,
        ];

        if (error.error?.stack)
            sections.push(`#### Stack\n${this.codeBlock(error.error.stack, 'text')}`);
        if (error.data)
            sections.push(`#### Data\n${this.codeBlock(error.data, 'json')}`);

        return sections.join('\n\n');
    }

    inline(value) {
        return `\`${String(value ?? 'Unavailable').replaceAll('`', '\\`')}\``;
    }

    timestamp(value) {
        const timestamp = new Date(value);
        return Number.isNaN(timestamp.getTime())
            ? 'Unavailable'
            : this.inline(timestamp.toISOString());
    }

    codeBlock(value, language = '') {
        const text = String(value);
        const ticks = text.match(/`+/g) ?? [];
        const fenceLength = Math.max(3, ...ticks.map(tick => tick.length + 1));
        const fence = '`'.repeat(fenceLength);
        return `${fence}${language}\n${text}\n${fence}`;
    }
}
