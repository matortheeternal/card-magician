import { importCard } from './importMse.js';
import { useGame } from '../../../shared/testing/gameFixture.js';

async function importStyled(stylesheet, styling) {
    const failures = [];
    const mseCard = {
        name: 'Test', stylesheet, has_styling: 'true', styling_data: styling
    };
    const card = await importCard({ stylesheet }, mseCard, {},
                                  error => failures.push(error.message));
    expect(failures).toEqual([]);
    return card.front;
}

describe('MSE styling import', () => {
    useGame('magic');

    it('imports the inverted common symbol only when enabled', async () => {
        const enabled = await importStyled('m15-altered', {
            inverted_common_symbol: 'yes'
        });
        const disabled = await importStyled('m15-altered', {
            inverted_common_symbol: 'no'
        });
        expect(enabled.commonSymbolStyle).toBe('inverted');
        expect(disabled.commonSymbolStyle).toBe('standard');
    });
});
