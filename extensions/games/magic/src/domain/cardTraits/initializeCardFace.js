import * as types from './cardTypes.js';
import * as text from './cardText.js';

const methods = {
    isLegendary: types.isLegendary,
    isLand: types.isLand,
    isBasicLand: types.isBasicLand,
    isCreature: types.isCreature,
    isArtifact: types.isArtifact,
    isEnchantment: types.isEnchantment,
    isVehicle: types.isVehicle,
    isSnow: types.isSnow,
    isConspiracy: types.isConspiracy,
    isToken: types.isToken,
    isEmblem: types.isEmblem,
    getImplicitLandSymbols: types.getImplicitLandSymbols,
    ...text
};

export function initializeCardFace(face) {
    for (const [name, method] of Object.entries(methods)) {
        Object.defineProperty(face, name, {
            value: method.bind(null, face),
            writable: true,
            configurable: true
        });
    }
}
