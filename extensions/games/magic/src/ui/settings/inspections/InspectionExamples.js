import './inspectionExamples.css';
import element from './element.js';
import { COLORS, colorIcon } from './inspectionColors.js';
import { SEVERITIES } from './tierSeverities.js';
import exampleCard from '../../../domain/inspections/exampleCard.js';

const L = localize('game-magic');
const CAPTIONS = {
    allowed: name => L`Allowed in ${name}`,
    bend: name => L`Bend in ${name}`,
    break: name => L`Break in ${name}`
};

export default class InspectionExamples extends ReactiveComponent {
    inspection = null;
    tiers = {};

    connectedCallback() {
        this.render();
    }

    get flaggedColors() {
        const isFlagged = color => SEVERITIES[this.tiers[color]].isFlagged;
        return Object.keys(COLORS).filter(isFlagged);
    }

    get shownColors() {
        const flagged = this.flaggedColors;
        if (flagged.length) return flagged;
        const isPrimary = color => this.tiers[color] === 'primary';
        const allowed = Object.keys(COLORS).find(isPrimary);
        return allowed ? [allowed] : [];
    }

    update(tiers) {
        const shown = this.shownColors.join();
        this.tiers = tiers;
        if (this.shownColors.join() !== shown) this.render();
    }

    render() {
        this.replaceChildren(...this.shownColors.map(color => this.figure(color)));
    }

    figure(color) {
        const severity = SEVERITIES[this.tiers[color]];
        const preview = element('cm-card-preview');
        preview.data = exampleCard(this.inspection, color);
        const caption = element('figcaption', CAPTIONS[severity.id](COLORS[color]));
        caption.prepend(colorIcon(color));
        const figure = element('figure');
        figure.dataset.severity = severity.id;
        figure.append(preview, caption);
        return figure;
    }
}

customElements.define('cm-inspection-examples', InspectionExamples);
