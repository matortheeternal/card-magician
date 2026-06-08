import TextModule from '../Text/main.js';
import { AbilityConverter } from './src/AbilityConverter.js';

const L = localize('module-M15-walkertext');

export default class WalkerText extends TextModule {
    get structureConverters() {
        return [AbilityConverter];
    }

    async styles() {
        return [
            await this.loadFile('style.css'),
        ];
    }
}
