import ClassicFrameModule from '../ClassicFrame/main.js';
import proxyAutoOptions from '../../M15/Frame/src/proxyAutoOptions.js';
import ClassicSplitFrame from './src/ClassicSplitFrame.js';
import ShiftedSplitFrame from './src/ShiftedSplitFrame.js';

const SPLIT_OPTIONS = [
    'frame', 'multicolorGradient', 'artifactGradient',
    'hybridStyle', 'hybridBlendStyle', 'borderColor'
];
const SPLIT_FRAMES = ['classic', 'shifted'];
const SIDES = ['top', 'bottom'];
const HALF_WATCH_KEYS = ['colorIdentity', 'superType', 'subType'];

function restrictFrameChoices(option) {
    if (option.id !== 'frame') return option;
    const options = option.options.filter(opt => SPLIT_FRAMES.includes(opt.id));
    return { ...option, options };
}

function sideVars(side, vars) {
    const merged = Object.assign({}, ...vars.map(v => v.style));
    const style = {};
    for (const [name, value] of Object.entries(merged))
        style[name.replace('--', `--${side}-`)] = value;
    return style;
}

export default class ClassicSplitFrameModule extends ClassicFrameModule {
    halfBackgrounds = {};

    static createOptions() {
        return super.createOptions()
            .filter(opt => SPLIT_OPTIONS.includes(opt.id))
            .map(restrictFrameChoices);
    }

    async init(card) {
        await super.init(card);
        card.canRotate = true;
        card.frames = [ShiftedSplitFrame, ClassicSplitFrame];
    }

    get cardClasses() {
        return [`frame-${this.activeFrame.frameId}`];
    }

    halvesReady(card) {
        return SIDES.every(side => card[side]?.colorIdentity);
    }

    selectFrames(card) {
        const wrapped = proxyAutoOptions(card, this.options);
        const Frame = card.frames.find(frame => frame.matches(wrapped));
        this.activeFrame = new Frame(wrapped, this);
        card.activeFrame = () => this.activeFrame;
        changed(card, 'activeFrame');
        for (const side of SIDES) {
            const half = this.activeFrame.createHalf(card[side]);
            card[side].activeFrame = () => half;
            changed(card[side], 'activeFrame');
        }
    }

    async buildHalf(card, side) {
        const half = card[side];
        const frame = half.activeFrame();
        const backgrounds = await frame.buildBackgrounds('frame', half);
        const vars = await frame.buildBackgrounds('vars', half);
        return { backgrounds, vars: sideVars(side, vars) };
    }

    async buildFrames(card) {
        const [backgrounds, top, bottom] = await Promise.all([
            this.activeFrame.buildBackgrounds('frame', card),
            this.buildHalf(card, 'top'),
            this.buildHalf(card, 'bottom'),
        ]);
        return { backgrounds, top, bottom };
    }

    applyFrames(card, { backgrounds, top, bottom }) {
        this.backgrounds = backgrounds;
        this.halfBackgrounds = { top: top.backgrounds, bottom: bottom.backgrounds };
        this.varStyle = { ...top.vars, ...bottom.vars };
        this.updateCardClasses(card);
        this.requestRender();
        this.requestRender({ render: 'renderTop' });
        this.requestRender({ render: 'renderBottom' });
    }

    async updateFrame(card) {
        if (!card.parent || !this.halvesReady(card)) return;
        this.selectFrames(card);
        card.setAspectRatio(this.activeFrame.artDimensions);
        const build = this.buildFrames(card);
        this.latestBuild = build;
        const frames = await build;
        if (build !== this.latestBuild) return;
        this.applyFrames(card, frames);
    }

    bind(card, watch) {
        super.bind(card, watch);
        for (const side of SIDES)
            watch(card[side], HALF_WATCH_KEYS, () => this.updateFrame(card));
    }

    renderHalf(side) {
        const backgrounds = this.halfBackgrounds[side];
        if (!backgrounds) return;
        return backgrounds.map(bg => {
            const style = this.objectToStyle(bg.style);
            return `<div class="bg frame-${bg.id}" style="${style}"></div>`;
        }).join('\n');
    }

    renderTop() {
        return this.renderHalf('top');
    }

    renderBottom() {
        return this.renderHalf('bottom');
    }
}
