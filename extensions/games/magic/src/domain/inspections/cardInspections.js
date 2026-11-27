import MissingArtistCredit from './completeness/MissingArtistCredit.js';
import MissingArt from './completeness/MissingArt.js';
import MissingRulesText from './completeness/MissingRulesText.js';
import MissingCreatureStats from './completeness/MissingCreatureStats.js';
import MissingLoyalty from './completeness/MissingLoyalty.js';
import MissingTokenCards from './project/MissingTokenCards.js';
import UnrecognizedText from './templating/UnrecognizedText.js';
import SelfReference from './templating/SelfReference.js';
import { OUTDATED_WORDINGS } from './templating/outdatedWordings.js';
import MissingReminderText from './templating/MissingReminderText.js';
import UnneededReminderText from './templating/UnneededReminderText.js';
import WordyForRarity from './design/WordyForRarity.js';
import DuplicateNames from './project/DuplicateNames.js';
import MixedHybridPips from './design/MixedHybridPips.js';
import MultiColorPhyrexian from './design/MultiColorPhyrexian.js';
import ManySymbolTypes from './design/ManySymbolTypes.js';
import OffColorActivation from './design/OffColorActivation.js';

export const CARD_INSPECTIONS = [
    new MissingArtistCredit(),
    new MissingArt(),
    new MissingRulesText(),
    new MissingCreatureStats(),
    new MissingLoyalty(),
    new MissingTokenCards(),
    new UnrecognizedText(),
    new SelfReference(),
    ...OUTDATED_WORDINGS,
    new MissingReminderText(),
    new UnneededReminderText(),
    new WordyForRarity(),
    new DuplicateNames(),
    new MixedHybridPips(),
    new MultiColorPhyrexian(),
    new ManySymbolTypes(),
    new OffColorActivation()
];
