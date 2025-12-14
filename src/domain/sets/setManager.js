import Alpine from 'alpinejs';
import JSONSerializer from './JSONSerializer.js';
import YAMLSerializer from './YAMLSerializer.js';
import MessagePackSerializer from './MessagePackSerializer.js';
import { addStatusMessage } from '../../ui/systems/statusSystem.js';
import { registerAction } from '../../ui/systems/actionSystem.js';

const L = localize('set-manager');
const serializers = [MessagePackSerializer, YAMLSerializer, JSONSerializer];

export async function saveSetData(filePath, data) {
    const serializer = serializers.find(s => s.matches(filePath));
    await serializer.save(filePath, data);
}

export async function loadSetData(filePath) {
    const serializer = serializers.find(s => s.matches(filePath));
    return await serializer.load(filePath);
}

export async function saveAs() {
    const views = Alpine.store('views');
    const defaultPath = views.setFilePath
        ?  views.setFilePath.split(/[\\\/]/).pop()
        : `${views.activeSet.title || L`My Set`}.json`;
    const filePath = await Neutralino.os.showSaveDialog(L`Save set to file`, {
        defaultPath,
        filters: [
            { name: L`JSON Files`, extensions: ['json'] },
            { name: L`Packed Files`, extensions: ['msgpack'] },
            { name: L`YAML Files`, extensions: ['yml'] },
            { name: L`All files`, extensions: ['*'] }
        ]
    });
    if (!filePath) return;
    console.info('Saving set to:', filePath);
    views.setFilePath = filePath;
    await saveSetData(filePath, views.activeSet);
}

export async function save() {
    const { activeSet, setFilePath } = Alpine.store('views');
    if (!setFilePath) return await saveAs();
    const message = addStatusMessage(L`Saving...`, -1);
    console.info('Saving set to:', setFilePath);
    await saveSetData(setFilePath, activeSet);
    message.text = L`Saved.`;
    setTimeout(() => message.remove(), 1000);
}

registerAction('save-set', save);
registerAction('save-set-as', saveAs);
