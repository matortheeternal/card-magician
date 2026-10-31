export default class ErrorReport {
    constructor(errors) {
        this.errors = Array.from(errors);
    }

    toMarkdown() {
        const sections = [
            '# Card Magician Error Report',
            `Generated: ${new Date().toISOString()}`,
            this.systemInformation(),
            `## Errors (${this.errors.length})`,
        ];

        if (this.errors.length === 0) {
            sections.push('No errors are currently visible in the application.');
        } else {
            sections.push(...this.errors.map((error, index) => {
                return this.errorInformation(error, index + 1);
            }));
        }

        return sections.join('\n\n');
    }

    systemInformation() {
        const applicationId = globalThis.appEnvironment?.id ?? 'Unavailable';
        const resourceMode = globalThis.appEnvironment?.resourceMode ?? 'Unavailable';
        const runtimeVersion = globalThis.appEnvironment?.runtimeVersion ?? 'Unavailable';
        const platform = navigator.userAgentData?.platform ?? navigator.platform;

        return `## System Information
- Application ID: ${this.inline(applicationId)}
- Electron version: ${this.inline(runtimeVersion)}
- Resource mode: ${this.inline(resourceMode)}
- Platform: ${this.inline(platform)}
- Language: ${this.inline(navigator.language)}
- User agent: ${this.inline(navigator.userAgent)}`;
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
