import CardFrame from '../../Frame/src/CardFrame.js';
import FrameResolution from '../../Frame/src/mixins/Frame.js';
import TrimMasks from '../../Frame/src/mixins/TrimMasks.js';
import VehicleTrim from '../../Frame/src/mixins/VehicleTrim.js';
import SnowTrim from '../../Frame/src/mixins/SnowTrim.js';
import Border from '../../Frame/src/mixins/Border.js';
import Node from '../../Frame/src/mixins/Node.js';
import Crowns from '../../Frame/src/mixins/Crowns.js';
import PT from '../../Frame/src/mixins/PT.js';

export default class SagaFrame extends CardFrame.with(
    FrameResolution,
    TrimMasks,
    VehicleTrim,
    SnowTrim,
    Border,
    Node,
    Crowns,
    PT,
) {
    get artDimensions() {
        return { width: 158, height: 446 };
    }
}
