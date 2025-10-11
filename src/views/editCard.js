import { buildForms } from './formBuilder';
import { saveHTMLAsImage } from '../gfx/imageProcessing';

export function publishTemplate(templateModel) {
    view.activeCard = templateModel;
    const forms = buildForms(templateModel);
    const main = document.querySelector('main');
    main.setAttribute('x-data', 'templateModel');
    const templateContainer = document.createElement('div');
    templateContainer.className = 'template-container';
    for (let model of Object.values(templateModel))
        templateContainer.appendChild(model.dom);

    main.appendChild(templateContainer);
    main.appendChild(forms);

    const cards = [...Object.values(templateModel)];
    Object.assign(templateModel, {
        save: async function() {
            const cardData = {};
            for (let card of cards) {
                cardData[card.id] = await card.save();
            }
            const jsonString = JSON.stringify(cardData);
            await Neutralino.filesystem.writeFile('./card.json', jsonString);
        },
        load: async function() {
            const jsonString = await Neutralino.filesystem.readFile('./card.json');
            const cardData = JSON.parse(jsonString);
            for (let card of cards) {
                await card.load(cardData[card.id]);
            }
        },
        exportImg: async function() {
            await saveHTMLAsImage(templateContainer, 'card.png');
        }
    });
}
