const VehicleTrimMixin = {
    get showVehicleTrim() {
        return (this.card.vehicleStyle !== 'disabled')
            && (this.card.vehicleStyle !== 'auto' || this.card.isVehicle?.());
    },

    get vehicleTrimUrl() {
        return this.resolveAssetPath('element/vehicle/trim.png');
    },

    async resolveVehicleTrim() {
        if (!this.showVehicleTrim) return null;
        const maskedImg = this.maskTrim(this.vehicleTrimUrl);
        return this.background('vehicle-trim', maskedImg);
    },
};

export default {
    group: 'frame',
    resolve: 'resolveVehicleTrim',
    mixin: VehicleTrimMixin
};
