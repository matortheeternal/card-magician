import Inspection from '../Inspection.js';
import InspectionFinding from '../InspectionFinding.js';
import { COMPLETENESS } from '../categories.js';
import rulesRange from '../rulesRange.js';
import createdTokens from './createdTokens.js';
import { getCardFaces, isOracleCard } from '../../oracleCardEligibility.js';
import { isToken } from '../../cardTraits/cardTypes.js';

const L = localize('game-magic');
const TOKEN_TEMPLATES = new Set([
    'magic/Classic/Token', 'magic/M15/Token', 'magic/M20/Token'
]);
const WHITESPACE = /\s+/g;

function isTokenCardFace(face) {
    return isToken(face) || TOKEN_TEMPLATES.has(face.template);
}

function tokenKey(name) {
    return name?.trim().replace(WHITESPACE, ' ').toLowerCase();
}

function tokenKeys(cards) {
    const keys = new Set();
    for (const face of cards.flatMap(getCardFaces).filter(isTokenCardFace)) {
        keys.add(tokenKey(face.name));
        keys.add(tokenKey(face.subType));
    }
    return keys;
}

export default class MissingTokenCards extends Inspection {
    constructor() {
        super({
            id: 'missing-token-cards',
            title: L`Missing tokens`,
            category: COMPLETENESS,
            description: L`Tokens that cards create without a matching token card.`
        });
    }

    inspect(cards) {
        const known = tokenKeys(cards);
        const findings = [];
        for (const card of cards.filter(isOracleCard)) {
            for (const face of getCardFaces(card).filter(item => !isTokenCardFace(item)))
                this.collect(findings, card, face, known);
        }
        return findings;
    }

    projectContext(cards) {
        return tokenKeys(cards);
    }

    inspectCard(card, project, tokenIndex) {
        const faces = getCardFaces(card);
        const created = faces.filter(face => !isTokenCardFace(face))
            .map(face => ({ face, names: createdTokens(face, card) }));
        if (!created.some(({ names }) => names.length)) return [];
        const known = tokenIndex ?? this.editorTokenKeys(card, project);
        return created.flatMap(({ face, names }) =>
            this.missing(card, face, known, names));
    }

    editorTokenKeys(card, project) {
        const otherCards = (project.cards ?? []).filter(other =>
            other !== (card.baseCard ?? card));
        return tokenKeys([...otherCards, card]);
    }

    collect(findings, card, face, known) {
        findings.push(...this.missing(card, face, known, createdTokens(face, card)));
    }

    missing(card, face, known, tokens) {
        const findings = [];
        for (const { name, range } of tokens) {
            if (known.has(tokenKey(name))) continue;
            const message = L`No token card for the ${name} token.`;
            const location = range ? rulesRange(range) : null;
            const finding = new InspectionFinding(this.id, card, face, message, location);
            finding.evidence = name;
            findings.push(finding);
        }
        return findings;
    }
}
