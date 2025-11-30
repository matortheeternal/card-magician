import FrameProvider from '../../Frame/src/providers/FrameProvider.js';

export default class MapFrameProvider extends FrameProvider {
    get ext() {
        return '.png';
    }

    get folder() {
        return `frame/map`;
    }

    get maskFolder() {
        return 'mask/map';
    }

    get hasLandTemplates() {
        return true;
    }
}
