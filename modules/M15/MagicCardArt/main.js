export default async function(card, utils) {
    card.artImageUrl = '';
    card.showArtImage = false;

    card.updateArtImage = function(event) {
        card.showArtImage = true;
        utils.updateCardImage(event, card, 'artImageUrl');
    };

    card.addField({
        id: 'artImage',
        type: 'file',
        displayName: 'Art Image',
        onChange: 'updateArtImage($event)'
    });

    card.publishElement('.card-art-image',
        `<img x-show="showArtImage" :src="artImageUrl" alt="Card Art" />`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
