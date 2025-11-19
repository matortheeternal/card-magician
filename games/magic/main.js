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

};
