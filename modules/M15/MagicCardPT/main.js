export default async function(card, utils) {
    card.showPT = true;

    async function updatePtStyle({ color }) {
        const url = await utils.assetURL(color + 'pt.png');
        card.ptStyle = { backgroundImage: `url("${url}")` };
    }

    card.ptUpdated = function() {
        card.showPT = card.toughness.length || card.power.length;
    };

    Alpine.effect(() => {
        if (!card.color) return;
        updatePtStyle(card.color);
    });

    card.addField({
        id: 'power',
        displayName: 'Power',
        onChange: 'ptUpdated()'
    });

    card.addField({
        id: 'toughness',
        displayName: 'Toughness',
        onChange: 'ptUpdated()'
    });

    card.publishElement('.card-pt-container',
        `<div class="pt-text" :style="ptStyle">
            <span x-text="power"></span>/<span x-text="toughness"></span>
        </div>`
    );

    card.addStyle(await utils.loadFile('style.css'));
}
