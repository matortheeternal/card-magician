export default class ClassicLayoutModule extends CardMagicianModule {
    async init() {
        await this.loadFont('Matrix', 'matrix-bold.ttf');
        await this.loadFont('ModMatrix', 'modmatrix.ttf');
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
