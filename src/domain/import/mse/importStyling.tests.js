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

    it('imports classic frame options from the old style', async () => {
        const face = await importStyled('old', {
            alpha_style_blending: 'yes',
            colored_nonbasic_land_trim: '',
            type_of_gradient_multicolor: 'trim only',
            eldrazi_colorless: 'yes'
        });
        expect(face.template).toBe('magic/Classic/Main');
        expect(face.frame).toBe('classic');
        expect(face.dualLandBlend).toBe('alpha');
        expect(face.nonbasicLandColoring).toBe('none');
        expect(face.multicolorGradient).toBe('trim');
        expect(face.artifactGradient).toBe('full');
        expect(face.colorlessStyle).toBe('eldrazi');
    });

});
