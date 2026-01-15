import NormalFrame from '../../Frame/src/NormalFrame.js';

export default class SagaFrame extends NormalFrame {
    frame = [
        this.resolveFrame,
        this.resolveVehicleTrim,
        this.resolveSnowTrim,
        this.resolveNyxTrim,
        this.resolveBorder,
        this.resolveNode,
        this.resolveCrown
    ];

    get artDimensions() {
        return { width: 158, height: 446 };
    }
}
