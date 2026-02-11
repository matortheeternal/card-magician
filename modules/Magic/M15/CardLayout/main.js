export default class CardLayoutModule extends CardMagicianModule {
    async init() {
        await this.loadFont('Beleren Bold', 'beleren-bold_P1.01.ttf');
        await this.loadFont('MPlantin-Italic', 'mplantinit.ttf');
        await this.loadFont('Beleren Small Caps Bold', 'belerensmallcaps-bold.ttf');
        await this.loadFont('Relay Medium', 'relay-medium.ttf');
        await this.loadFont('MPlantin', 'mplantin.ttf');
    }

    async styles() {
        return [await this.loadFile('style.css')];
    }
}
