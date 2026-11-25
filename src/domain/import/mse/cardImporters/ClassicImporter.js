import M15AlteredImporter from './M15AlteredImporter.js';

const NONBASIC_LAND_COLORINGS = {
    'trim, textbox': 'trimAndTextbox',
    'textbox': 'textbox',
    'trim': 'trim',
    '': 'none',
};

const GRADIENTS = {
    'full card': 'full',
    'trim only': 'trim',
};

export default class ClassicImporter extends M15AlteredImporter {
    static expectedVersion = '2025-10-20';
    static expectedStylesheet = 'old';

    get template() {
        return 'magic/Classic/Main';
    }

    get frame() {
        return 'classic';
    }

    get artSize() {
        return 'auto';
    }

    get dualLandBlend() {
        if (this.stylingData?.alpha_style_blending === 'yes') return 'alpha';
        return 'gradient';
    }

    get nonbasicLandColoring() {
        const coloring = this.stylingData?.colored_nonbasic_land_trim;
        return NONBASIC_LAND_COLORINGS[coloring] ?? 'trimAndTextbox';
    }

    get multicolorGradient() {
        return GRADIENTS[this.stylingData?.type_of_gradient_multicolor] ?? 'full';
    }

    get artifactGradient() {
        return GRADIENTS[this.stylingData?.type_of_gradient_artifact] ?? 'full';
    }

    get colorlessStyle() {
        if (this.stylingData?.eldrazi_colorless === 'yes') return 'eldrazi';
        return 'standard';
    }

    async importOptions(cmCardFace) {
        await super.importOptions(cmCardFace);
        cmCardFace.dualLandBlend = this.dualLandBlend;
        cmCardFace.nonbasicLandColoring = this.nonbasicLandColoring;
        cmCardFace.multicolorGradient = this.multicolorGradient;
        cmCardFace.artifactGradient = this.artifactGradient;
        cmCardFace.colorlessStyle = this.colorlessStyle;
    }
}
