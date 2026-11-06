import TemplateActivation from './TemplateActivation.js';
import CardpartActivation from './CardpartActivation.js';
import ExporterActivation from './ExporterActivation.js';
import ReloadActivation from './ReloadActivation.js';

const activations = [
    TemplateActivation, CardpartActivation, ExporterActivation, ReloadActivation
];

export function activateExtension(row, wasInstalled) {
    const Activation = activations.find(strategy => strategy.matches(row));
    return new Activation(row, wasInstalled).activate();
}
