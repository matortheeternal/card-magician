import { getCardFaces } from '../oracleCardEligibility.js';

export default function parsedRules(face, card) {
    const faceCount = getCardFaces(card).length;
    return activeGame.oracleAssistance.parse(face, face.rulesText, faceCount);
}
