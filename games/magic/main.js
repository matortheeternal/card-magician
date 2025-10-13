export default async function(game, utils) {
    const { buildColumns } = await utils.import('columns.js');
    const { calculateCmc } = await utils.import('cmcCalculator.js');
    // TODO: eventually we can remove this because we will store colors on the card
    const { calculateColors } = await utils.import('colorCalculator.js');

    const columns = buildColumns({ calculateCmc, calculateColors });
    for (let column of columns)
        game.gridColumns.push(column);

    game.newCard = function() {
        return {
            template: 'M15Mainframe',
            model: {
                card: { name: 'New Card' }
            }
        }
    }
};
