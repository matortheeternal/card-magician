import NameModule from '../../M15/Name/main.js';

export default class MechanicNameModule extends NameModule {
    async styles() {
        const nameboxUrl = this.resolveAsset('namebox.png');
        return [
            await this.loadFile('style.css'),
            `:host { --namebox-background: url('${nameboxUrl}'); }`
        ];
    }
}
