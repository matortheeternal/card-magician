import { registerView } from '../../viewRegistry.js';
import html from './editCard.html';
import { buildCard } from '../../templateBuilder';
import { buildCardForm } from './formBuilder.js';

registerView('edit-card', html, async function(scope, { element }) {
    const templateContainer = element.querySelector('.template-container');
    const formsContainer = element.querySelector('.forms-container');
    const { activeCard } = view;
    scope.card = await buildCard(activeCard.template);

    for (const face of Object.values(scope.card.model)) {
        await face.load(activeCard.model[face.id]);
        templateContainer.appendChild(face.dom);
        formsContainer.appendChild(buildCardForm(face));
    }

    function getFieldContainer(entries, groups, field) {
        if (!field.group) return entries;
        if (groups.hasOwnProperty(field.group))
            return groups[field.group];

        const group = { isGroup: true, fields: [] };
        groups[field.group] = group;
        return group.fields;
    }

    scope.formEntries = function(model) {
        const entries = [];
        const groups = {};
        for (let field of model.fields) {
            const fieldContainer = getFieldContainer(entries, groups, field);
            fieldContainer.push(field);
        }
        return entries;
    };

    scope.save = async function() {
        for (const face of Object.values(scope.card.model))
            activeCard.model[face.id] = await face.save();
    };

    scope.close = async function() {
        await save();
        view.activeCard = null;
    };
});
