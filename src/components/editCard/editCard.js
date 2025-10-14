import { registerComponent } from '../../componentRegistry.js';
import html from './editCard.html';
import { buildCard } from '../../templateBuilder';
import { buildCardForm } from './formBuilder.js';

registerComponent('edit-card', html, async function(scope, { element }) {
    const templateContainer = element.querySelector('.template-container');
    const formsContainer = element.querySelector('.forms-container');
    const { activeCard } = view;
    scope.topCard = await buildCard(activeCard.template);

    Alpine.nextTick(async () => {
        for (const face of Object.values(scope.topCard.model)) {
            await face.load(activeCard.model[face.id]);
            templateContainer.appendChild(face.dom);
            formsContainer.appendChild(buildCardForm(face));
        }
    });

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
        for (const face of Object.values(scope.topCard.model))
            activeCard.model[face.id] = await face.save();
    };

    scope.close = async function() {
        await scope.save();
        view.activeCard = null;
    };
});
