export default async function(card, utils) {
    card.addField({
        id: 'artImage',
        type: 'image',
        displayName: 'Art Image',
        default: {
            image: null, filename: '',
            width: '', height: '',
            xOffset: 0, yOffset: 0,
        }
    });

    card.publishElement('art-image',
        `<div x-crop-image="artImage"></div>
         <img x-show="!artImage.image" :src="defaultImageUrl" alt="Placeholder image" />`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
