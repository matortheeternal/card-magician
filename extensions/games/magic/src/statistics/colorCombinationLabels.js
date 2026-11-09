import { localizeStatisticsText } from './localization.js';

const FACTIONS = new Map([
    ['wu', ['Azorius', 'WU']],
    ['ub', ['Dimir', 'UB']],
    ['br', ['Rakdos', 'BR']],
    ['rg', ['Gruul', 'RG']],
    ['wg', ['Selesnya', 'GW']],
    ['wb', ['Orzhov', 'WB']],
    ['ur', ['Izzet', 'UR']],
    ['bg', ['Golgari', 'BG']],
    ['wr', ['Boros', 'RW']],
    ['ug', ['Simic', 'GU']],
    ['wug', ['Bant', 'GWU']],
    ['wub', ['Esper', 'WUB']],
    ['ubr', ['Grixis', 'UBR']],
    ['brg', ['Jund', 'BRG']],
    ['wrg', ['Naya', 'RGW']],
    ['wbg', ['Abzan', 'WBG']],
    ['wur', ['Jeskai', 'URW']],
    ['ubg', ['Sultai', 'BGU']],
    ['wbr', ['Mardu', 'RWB']],
    ['urg', ['Temur', 'GUR']]
]);

export function colorCombinationLabel(id) {
    const faction = FACTIONS.get(id);
    if (!faction) return id.toUpperCase();
    const [name, colors] = faction;
    return `${localizeStatisticsText(name)} (${colors})`;
}
