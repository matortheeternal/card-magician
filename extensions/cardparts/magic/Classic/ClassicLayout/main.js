export default class ClassicLayoutModule extends CardMagicianModule {
    async init() {
        await this.loadFont('Matrix', 'matrix-bold.ttf');
        await this.loadFont('ModMatrix', 'modmatrix.ttf');
        await this.loadFont('MPlantin-Bold', 'mplantin-bold.ttf');
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
