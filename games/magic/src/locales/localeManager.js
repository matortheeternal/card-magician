import locale from './en.locale.json'; // In the future, change this to not be manual

export const numberWord = locale.numberWords.map(n => Array.isArray(n) ? n[0] : n);
export const numberWordOrA = locale.numberWords.map(n => Array.isArray(n) ? n[1] : n);