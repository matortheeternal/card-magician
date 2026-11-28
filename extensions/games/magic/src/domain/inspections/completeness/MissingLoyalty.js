import CardInspection from '../CardInspection.js';
import { COMPLETENESS } from '../categories.js';
import { isBlank } from '../faceTraits.js';
import { getCardTypes } from '../../cardTraits/cardTypes.js';

const L = localize('game-magic');

export default class MissingLoyalty extends CardInspection {
    constructor() {
        super({
            id: 'missing-loyalty',
            title: L`Planeswalkers without loyalty`,
            field: 'loyalty',
            resolution: L`Focus the loyalty field`,
            category: COMPLETENESS,
            description: L`Planeswalkers missing starting loyalty.`
        });
    }

    findingFor(face) {
        if (!getCardTypes(face).includes('Planeswalker')) return null;
        return isBlank(face.loyalty) ? L`Loyalty is missing.` : null;
    }
}
