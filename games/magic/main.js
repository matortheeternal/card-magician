export default async function(game, utils) {
    const { buildColumns } = await utils.import('columns.js');
    const { calculateCmc } = await utils.import('cmcCalculator.js');
    // TODO: eventually we can remove this because we will store colors on the card
    const { calculateColors } = await utils.import('colorCalculator.js');

    const columns = buildColumns({ calculateCmc, calculateColors });
    for (let column of columns) game.columns.push(column);

    game.defaultTemplateId = 'M15Main';

    game.newCard = function() {
        return { model: { front: {} }, style: { front: {} } };
    };

    game.newSet = function() {
        return { cards: [], info: { setCode: "TEST" } };
    };

    game.renderSetInfo = function() {
        return ( 
            `<sl-input label="Title"
                x-model="set.info.title"
                autocomplete="off"></sl-input>
            <sl-input label="Description"
                x-model="set.info.description"
                autocomplete="off"></sl-input>
            <sl-input label="Default Artist"
                x-model="set.info.defaultArtist"
                autocomplete="off"></sl-input>
            <sl-input label="Copyright"
                x-model="set.info.defaultLegalText"
                autocomplete="off"></sl-input>
            <sl-input label="Set code"
                x-model="set.info.setCode"
                autocomplete="off"></sl-input>
            <sl-input label="Language"
                x-model="set.info.language"
                autocomplete="off"></sl-input>`
        );
    }
};