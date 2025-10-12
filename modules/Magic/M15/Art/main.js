export default async function(card, utils) {
    card.artImage = { image: null, filename: '' };

    card.addField({
        id: 'artImage',
        type: 'image',
        displayName: 'Art Image'
    });

    card.publishElement('art-image',
        `<img x-show="artImage.image" :src="artImage.image" alt="Card Art" />
         <img x-show="!artImage.image" :src="defaultImageUrl" alt="Placeholder image" />`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
