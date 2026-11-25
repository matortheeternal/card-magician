import ClassicFrame from '../../ClassicFrame/src/ClassicFrame.js';
import LoyaltyCosts from './mixins/LoyaltyCosts.js';

export default class WalkerFrame extends ClassicFrame.with(LoyaltyCosts) {
    static matches() {
        return true;
    }
}
