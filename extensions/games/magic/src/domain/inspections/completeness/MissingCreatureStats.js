import CardInspection from '../CardInspection.js';
import { COMPLETENESS } from '../categories.js';
import { isBlank } from '../faceTraits.js';
import { isCreature, isVehicle } from '../../cardTraits/cardTypes.js';

const L = localize('game-magic');

export default class MissingCreatureStats extends CardInspection {
    constructor() {
        super({
            id: 'missing-creature-stats',
            title: L`Creatures without power and toughness`,
            category: COMPLETENESS,
            description: L`Creatures and Vehicles missing power or toughness.`
        });
    }

    findingFor(face) {
        if (!isCreature(face) && !isVehicle(face)) return null;
        if (!isBlank(face.power) && !isBlank(face.toughness)) return null;
        return L`Power or toughness is missing.`;
    }
}
