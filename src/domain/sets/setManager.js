import Alpine from 'alpinejs';
import JSONSerializer from './JSONSerializer.js';
import YAMLSerializer from './YAMLSerializer.js';
import MessagePackSerializer from './MessagePackSerializer.js';
import { addStatusMessage } from '../../ui/systems/statusSystem.js';
import { registerAction } from '../../ui/systems/actionSystem.js';

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
        : `${views.activeSet.title || 'My Set'}.json`;
    const filePath = await Neutralino.os.showSaveDialog('Save set to file', {
        defaultPath,
        filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'Packed Files', extensions: ['msgpack'] },
            { name: 'YAML Files', extensions: ['yml'] },
            { name: 'All files', extensions: ['*'] }
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
    const message = addStatusMessage('Saving...', -1);
    console.info('Saving set to:', setFilePath);
    await saveSetData(setFilePath, activeSet);
    message.text = 'Saved.';
    setTimeout(() => message.remove(), 1000);
}

registerAction('save-set', save);
registerAction('save-set-as', saveAs);
