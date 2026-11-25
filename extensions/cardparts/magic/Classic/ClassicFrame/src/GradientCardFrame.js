import ClassicCardFrame from './ClassicCardFrame.js';

export default class GradientCardFrame extends ClassicCardFrame {
    get useLandHybridBlend() {
        return false;
    }

    get useHybridBlend() {
        return false;
    }

    gradientMaskUrl(gradient) {
        return `${this.blendMaskFolder}/blend_gradient_${gradient}.png`;
    }

    get multicolorBlendMaskUrl() {
        return this.gradientMaskUrl(this.card.multicolorGradient);
    }

    get useArtifactBlend() {
        return super.useArtifactBlend && !this.useMulticolorBlend;
    }

    get artifactBlendMaskUrl() {
        return this.gradientMaskUrl(this.card.artifactGradient);
    }
}
