import defaultSetSymbol from './defaultSymbol.svg.js';

const L = localize('game-magic');

export const titleField = {
    id: 'title',
    label: L`Title`,
};

export const descriptionField = {
    id: 'description',
    label: L`Description`,
};

export const illustratorField = {
    id: 'illustrator',
    label: L`Default Artist`,
};

export const legalTextField = {
    id: 'legalText',
    label: L`Copyright`,
};

export const setCodeField = {
    id: 'setCode',
    label: L`Set code`
};

export const languageField = {
    id: 'language',
    label: L`Language`,
    default: L`EN`
};

export const collectorNumberFormatField = {
    id: 'collectorNumberFormat',
    label: L`Collector Number Format`,
    type: 'select',
    options: [
        { id: 'four', name: '0001' },
        { id: 'threeOutOf', name: '001/999' },
    ]
};

export const rarityOrderField = {
    id: 'rarityOrder',
    label: L`Footer Rarity Order`,
    type: 'select',
    options: [
        { id: 'before', name: L`Before Collector Number` },
        { id: 'after', name: L`After Collector Number` },
    ]
};

export const symbolField = {
    id: 'symbol',
    label: L`Set Symbol`,
    type: 'code',
    default: defaultSetSymbol,
    syntax: 'xml'
};

export default [
    titleField,
    descriptionField,
    illustratorField,
    legalTextField,
    setCodeField,
    languageField,
    collectorNumberFormatField,
    rarityOrderField,
    symbolField
];
