import Provider from './Provider.js';

export default class VehicleTrimProvider extends Provider {
    static enabled(card) {
        return card.isVehicle?.();
    }

    get isTrim() {
        return true;
    }

    async resolve() {
        return await this.assetURL('element/vehicle/trim.png');
    }
}
