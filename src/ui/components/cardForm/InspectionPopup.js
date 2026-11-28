import inspectionHoverBridge from './inspectionHoverBridge.js';
import openInspectionSettings from '../../settings/openInspectionSettings.js';
import ReactiveComponent from '../ReactiveComponent.js';

const L = localize('card-form');
const POINTER_GAP = 5;
const CLOSE_DELAY = 220;

function action(label, callback) {
    const button = document.createElement('sl-button');
    button.size = 'small';
    button.variant = 'text';
    button.textContent = label;
    button.addEventListener('click', event => {
        event.stopPropagation();
        callback();
    });
    return button;
}

export default class InspectionPopup extends ReactiveComponent {
    #timer;
    #anchor;
    #placementAnchor;
    #scrollRegion;
    #hover;
    #bridge;
    #trackPointer = event => this.trackPointer(event);
    #pressedPointer;
    #release = event => this.releasePointer(event);
    #resize = () => this.position();
    #observer = new ResizeObserver(this.#resize);

    connectedCallback() {
        this.popover = 'auto';
        this.setAttribute('role', 'dialog');
        this.setAttribute('aria-label', L`Inspection findings`);
        this.on('pointerenter', () => {
            this.#bridge = null;
            this.keepOpen();
        });
        this.on('pointerleave', () => this.leave());
        this.on('pointerdown', event => this.pressPointer(event));
        for (const eventType of ['pointerup', 'mousedown', 'mouseup', 'click'])
            this.on(eventType, event => event.stopPropagation());
        window.addEventListener('pointerup', this.#release, true);
        window.addEventListener('pointercancel', this.#release, true);
        window.addEventListener('scroll', this.#resize, true);
        window.addEventListener('pointermove', this.#trackPointer, true);
        this.#observer.observe(this);
        window.addEventListener('resize', this.#resize);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.keepOpen();
        this.#observer.disconnect();
        window.removeEventListener('resize', this.#resize);
        window.removeEventListener('scroll', this.#resize, true);
        window.removeEventListener('pointermove', this.#trackPointer, true);
        window.removeEventListener('pointerup', this.#release, true);
        window.removeEventListener('pointercancel', this.#release, true);
    }

    get firstAction() {
        return this.querySelector('sl-button');
    }

    keepOpen() {
        clearTimeout(this.#timer);
    }

    leaveAnchor(anchor, event) {
        if (anchor !== this.#anchor || !this.#hover || !this.matches(':popover-open'))
            return;
        const point = { x: event.clientX, y: event.clientY };
        this.#bridge = event.relatedTarget
            ? inspectionHoverBridge(point, this.getBoundingClientRect())
            : null;
        this.leave();
    }

    trackPointer(event) {
        if (!this.#bridge) return;
        if (!this.matches(':popover-open')) {
            this.#bridge = null;
            return;
        }
        if (this.#bridge({ x: event.clientX, y: event.clientY })) {
            this.keepOpen();
            return;
        }
        this.#bridge = null;
        this.leave();
    }

    pressPointer(event) {
        event.stopPropagation();
        this.#pressedPointer = event.pointerId;
        this.keepOpen();
    }

    releasePointer(event) {
        if (this.#pressedPointer !== event.pointerId) return;
        this.#pressedPointer = undefined;
        if (!this.matches(':hover')) this.leave();
    }

    leave() {
        this.keepOpen();
        if (!this.#hover || this.#pressedPointer !== undefined) return;
        this.#timer = setTimeout(() => this.close(), CLOSE_DELAY);
    }

    close(restoreFocus = false) {
        this.#bridge = null;
        this.#pressedPointer = undefined;
        this.keepOpen();
        if (!this.matches(':popover-open')) return;
        this.hidePopover();
        if (restoreFocus) this.#anchor?.focus();
    }

    row(finding) {
        const row = document.createElement('section');
        const title = document.createElement('strong');
        title.textContent = finding.title;
        const message = document.createElement('p');
        message.textContent = finding.message;
        const actions = document.createElement('footer');
        if (finding.resolution && !finding.ignored) {
            actions.append(action(finding.resolution.label,
                                  () => this.emit('inspection-resolve', finding)));
        }
        const label = finding.ignored ? L`Restore finding` : L`Ignore this occurrence`;
        actions.append(action(label, () =>
            this.emit('inspection-toggle-ignore', finding)));
        actions.append(action(L`Configure this inspection`, () => {
            this.close();
            openInspectionSettings(finding.inspectionId);
        }));
        const content = document.createElement('div');
        content.append(title, message);
        row.append(content, actions);
        return row;
    }

    open(anchor, findings, options = {}) {
        this.keepOpen();
        const openOnAnchor = anchor === this.#anchor && this.matches(':popover-open');
        if (options.hover && (openOnAnchor || this.#bridge)) return;
        this.#bridge = null;
        this.#anchor = anchor;
        this.#hover = options.hover;
        this.#placementAnchor = options.target ?? anchor;
        this.#scrollRegion = options.scrollRegion;
        this.replaceChildren(...findings.map(finding => this.row(finding)));
        this.showPopover();
        this.position();
        if (!options.hover) void this.focusFirstAction();
    }

    async focusFirstAction() {
        const first = this.firstAction;
        await first?.updateComplete;
        if (first?.isConnected && this.matches(':popover-open'))
            first.focus({ preventScroll: true });
    }

    isAnchorVisible(anchor) {
        if (!this.#scrollRegion) return true;
        const region = this.#scrollRegion.getBoundingClientRect();
        return anchor.bottom > region.top && anchor.top < region.bottom;
    }

    position() {
        if (!this.matches(':popover-open')) return;
        if (!this.#placementAnchor.isConnected) return this.close();
        const anchor = this.#placementAnchor.getBoundingClientRect();
        if (!this.isAnchorVisible(anchor)) return this.close();
        const { width, height } = this.getBoundingClientRect();
        const { clientWidth, clientHeight } = document.documentElement;
        const maxLeft = clientWidth - width - POINTER_GAP;
        const maxTop = clientHeight - height - POINTER_GAP;
        const below = anchor.bottom + POINTER_GAP;
        const vertical = below <= maxTop ? below : anchor.top - height - POINTER_GAP;
        const left = Math.max(POINTER_GAP, Math.min(anchor.left, maxLeft));
        this.style.left = `${left}px`;
        this.style.top = `${Math.max(POINTER_GAP, Math.min(vertical, maxTop))}px`;
    }
}

customElements.define('cm-inspection-popup', InspectionPopup);
