export default async function(card, utils) {
    card.addField({
        id: 'artImage',
        type: 'image',
        displayName: 'Art Image',
        default: { image: null, filename: '' }
    });

    card.publishElement('art-image',
        `<img x-show="face.artImage.image" :src="face.artImage.image" alt="Card Art" />
         <img x-show="!face.artImage.image" :src="face.defaultImageUrl" alt="Placeholder image" />`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
