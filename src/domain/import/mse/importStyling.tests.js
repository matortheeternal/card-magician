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

    it('imports the classic shifted style into the shifted frame', async () => {
        const face = await importStyled('classicshifted', {});
        expect(face.template).toBe('magic/Classic/Main');
        expect(face.frame).toBe('shifted');
    });

    it('imports classic art background styles as frameless or borderless', async () => {
        const bordered = await importStyled('old-artbg', { display_border: 'yes' });
        const borderless = await importStyled('classicshifted-artbg', {});
        expect(bordered.frame).toBe('classic');
        expect(bordered.artSize).toBe('frameless');
        expect(borderless.frame).toBe('shifted');
        expect(borderless.artSize).toBe('borderless');
    });

    it('imports the classic clear style with its opacity and border', async () => {
        const face = await importStyled('old-clear', {
            frame_opacity: '40', border_visible: 'no'
        });
        expect(face.template).toBe('magic/Classic/Main');
        expect(face.frame).toBe('clear');
        expect(face.frameOpacity).toBe(40);
        expect(face.artSize).toBe('borderless');
    });

    it('imports classic tokens and sagas into their templates', async () => {
        const token = await importStyled('old-token', {
            type_of_gradient_multicolor: 'trim only'
        });
        const saga = await importStyled('old-saga', {});
        expect(token.template).toBe('magic/Classic/Token');
        expect(token.multicolorGradient).toBe('trim');
        expect(saga.template).toBe('magic/Classic/Saga');
    });
});
