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
            resolution: L`Focus the missing field`,
            category: COMPLETENESS,
            description: L`Creatures and Vehicles missing power or toughness.`
        });
    }

    findingsFor(face) {
        if (!isCreature(face) && !isVehicle(face)) return [];
        return ['power', 'toughness'].filter(field => isBlank(face[field]))
            .map(field => ({
                message: L`Power or toughness is missing.`,
                location: { field },
                resolution: { type: 'focus', label: this.resolution }
            }));
    }
}
