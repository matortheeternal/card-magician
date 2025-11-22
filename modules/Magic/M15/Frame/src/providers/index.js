import FrameProvider from './FrameProvider.js';
import BorderProvider from './BorderProvider.js';
import CrownProvider from './CrownProvider.js';
import NyxTrimProvider from './NyxTrimProvider.js';
import SnowTrimProvider from './SnowTrimProvider.js';
import VehicleTrimProvider from './VehicleTrimProvider.js';
import MiracleTrimProvider from './MiracleTrimProvider.js';

export const providers = [
    FrameProvider,
    VehicleTrimProvider,
    SnowTrimProvider,
    NyxTrimProvider,
    BorderProvider,
    CrownProvider,
    MiracleTrimProvider
];

providers.forEach((provider, zIndex) => {
    provider.prototype.zIndex = zIndex * 10;
});

export default providers;
