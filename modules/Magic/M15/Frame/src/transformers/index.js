import LandBlendMaskTransformer from './LandBlendMaskTransformer.js';
import MulticolorBlendMaskTransformer from './MulticolorBlendMaskTransformer.js';
import HybridBlendMaskTransformer from './HybridBlendMaskTransformer.js';
import ArtifactBlendMaskTransformer from './ArtifactBlendMaskTransformer.js';
import FrameMaskTransformer from './FrameMaskTransformer.js';
import TrimMaskTransformer from './TrimMaskTransformer.js';
import CrownMaskTransformer from './CrownMaskTransformer.js';

const transformers = [
    LandBlendMaskTransformer,
    MulticolorBlendMaskTransformer,
    HybridBlendMaskTransformer,
    ArtifactBlendMaskTransformer,
    FrameMaskTransformer,
    TrimMaskTransformer,
    CrownMaskTransformer
];

export default transformers;
