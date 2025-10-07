export default async function(card, utils) {
    card.artImageUrl = '';
    card.showArtImage = false;

    card.updateArtImage = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        utils.disposeImage(card, 'artImageUrl');
        card.artImageUrl = URL.createObjectURL(file);
        card.showArtImage = true;
    };

    card.addField({
        id: 'artImage',
        type: 'file',
        displayName: 'Art Image',
        save: async () => {
            if (!card.artImageUrl) return null;
            const response = await fetch(card.artImageUrl);
            const blob = await response.blob();
            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to read data stream.'));
                reader.readAsDataURL(blob);
            });
        },
        load: async (cardData) => {
            utils.disposeImage(card, 'artImageUrl');
            if (!cardData.artImage) return null;
            const blob = utils.parseBlob(cardData.artImage);
            card.artImageUrl = URL.createObjectURL(blob);
            card.showArtImage = true;
            return '';
        },
        onChange: 'updateArtImage($event)'
    });

    card.publishElement('art-image',
        `<img x-show="showArtImage" :src="artImageUrl" alt="Card Art" />
         <img x-show="!showArtImage" :src="defaultImageUrl" alt="Placeholder image" />`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
