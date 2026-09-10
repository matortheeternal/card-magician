import DoubleFaceStructure from './cardStructures/DoubleFaceStructure.js';
import SkipStructure from './cardStructures/SkipStructure.js';
import SingleFaceStructure from './cardStructures/SingleFaceStructure.js';

const cardStructures = [
    DoubleFaceStructure,
    SkipStructure,
    SingleFaceStructure,
];

export function getStructure(mseCard, cmCard, cardsByUid) {
    for (const CardStructure of cardStructures) {
        if (CardStructure.match(mseCard, cmCard, cardsByUid))
            return new CardStructure(mseCard, cmCard, cardsByUid);
    }
}
