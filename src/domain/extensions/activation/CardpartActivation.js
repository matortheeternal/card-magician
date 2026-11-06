import ExtensionActivation from './ExtensionActivation.js';

// Cardparts are imported on demand by BaseCardModel through findExtension().
export default class CardpartActivation extends ExtensionActivation {
    static type = 'cardpart';
    static folder = 'cardparts';
}
