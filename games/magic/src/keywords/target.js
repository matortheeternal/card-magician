const cardTypes = [
    "creature",
    "artifact",
    "enchantment",
    "planeswalker",
    "battle",
    "land",
    "permanent",
    "legendary",
    "basic",
    "snow",
    "token"
];

const cardTypeRegex = `((${cardTypes.join('|')}) ?)+`;
const itRegex = (kw, card) => new RegExp(`(This ${card.getThisType()} (has|gains) ${kw})|Target ${cardTypeRegex} gains ${kw}|put a ${kw} counter`, "i");
const theyRegex = /Creatures|All .*? creatures|.*? or .*? you control|.*? you control|Each .*? you control/i;

export function getTarget(str, kw, card) {
    if (str.match(itRegex(kw, card))) return "It";
    if (str.match(theyRegex)) return "They";
    return `This ${card.getThisType()}`;
}

export function targetToObject(target, type) {
    if (target === "They") return "them";
    if (target === "It") return "it";
    return "that " + (type || "permanent");
}