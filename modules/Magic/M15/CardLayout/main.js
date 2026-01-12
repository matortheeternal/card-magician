export default class CardLayoutModule extends CardMagicianModule {
    async styles() {
        return [await this.loadFile('style.css')];
    }
}
