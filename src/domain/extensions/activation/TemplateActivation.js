import ExtensionActivation from './ExtensionActivation.js';
import { getTemplate, registerTemplate } from '../../template/templateRegistry.js';

export default class TemplateActivation extends ExtensionActivation {
    static type = 'template';
    static folder = 'templates';

    get isRegistered() {
        return super.isRegistered || !!getTemplate(this.row.id);
    }

    async register(directory) {
        const template = await registerTemplate(directory);
        if (!template) throw new Error('Template is missing required views.');
    }
}
