import openInspectionSettings from '../../settings/openInspectionSettings.js';
import '../cardForm/InspectionPopup.js';
import ProblemsTree from './ProblemsTree.js';
import ReactiveComponent from '../ReactiveComponent.js';
import { onActiveProjectChanged } from '../../../domain/projects/projectManager.js';
import { executeAction } from '../../systems/actionSystem.js';
import { flushPendingCardSaves } from '../../systems/cardEditingSystem.js';
import { describeFindings } from '../cardForm/cardInspectionPresentation.js';

const L = localize('card-list');
const report = createReporter({ unit: 'ProjectInspections' });
const CHUNK_TIME = 8;
const yieldToUI = () => new Promise(resolve => {
    setTimeout(resolve, 0);
});

function listedFinding(finding) {
    const {
        inspectionId, title, message, side, location, key, resolution, ignored
    } = finding;
    const field = location?.field;
    return { inspectionId, title, message, side, key, field, resolution, ignored };
}

function branch(label) {
    const item = document.createElement('sl-tree-item');
    const title = document.createElement('span');
    title.className = 'problem-branch-label';
    title.textContent = label;
    const count = document.createElement('span');
    count.className = 'text-muted';
    title.append(' ', count);
    item.append(title);
    item.expanded = true;
    return { item, count };
}

export default class ProjectInspections extends ReactiveComponent {
    #project;
    #results;
    #resultsBranch;
    #ignoredBranch;
    #unsubscribe;
    #scanId = 0;
    #onCardInspections = event => this.updateCard(event.detail);

    connectedCallback() {
        this.render();
        const options = {
            openFinding: (anchor, item) => this.openFinding(anchor, item),
            openCard: card => this.openCard(card),
            openInspection: openInspectionSettings
        };
        this.#resultsBranch = this.createBranch(L`Inspection Results`, options);
        this.#ignoredBranch = this.createBranch(L`Ignored`, options);
        this.resultsTree.append(this.#resultsBranch.item);
        this.handleEvents('click', {
            scanProblems: () => this.scan(),
            toggleIgnored: () => this.toggleIgnored(),
            expandProblems: () => this.setExpanded(true),
            collapseProblems: () => this.setExpanded(false)
        });
        this.on('inspection-resolve', event =>
            this.applyFinding(event.detail, 'resolve'));
        this.on('inspection-toggle-ignore', event =>
            this.applyFinding(event.detail, 'ignore'));
        this.#unsubscribe = onActiveProjectChanged(project => this.setProject(project));
        document.addEventListener('card-inspections-updated', this.#onCardInspections);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#scanId++;
        this.#unsubscribe?.();
        document.removeEventListener('card-inspections-updated', this.#onCardInspections);
    }

    get scanButton() {
        return this.querySelector('[data-click-action="scanProblems"]');
    }

    get status() {
        return this.querySelector('output');
    }

    get resultsRegion() {
        return this.querySelector('.problem-results');
    }

    get resultsTree() {
        return this.resultsRegion.querySelector('sl-tree');
    }

    get inspectionPopup() {
        return this.querySelector('cm-inspection-popup');
    }

    get ignoredButton() {
        return this.querySelector('[data-click-action="toggleIgnored"]');
    }

    createBranch(label, options) {
        const { item, count } = branch(label);
        return { item, count, tree: new ProblemsTree(item, options) };
    }

    toggleIgnored() {
        const show = !this.#ignoredBranch.item.isConnected;
        this.setIgnoredVisible(show);
        if (show && !this.#results && !this.scanButton.disabled) void this.scan();
    }

    setIgnoredVisible(show) {
        this.inspectionPopup.close();
        const button = this.ignoredButton;
        button.name = show ? 'eye-slash' : 'eye';
        button.label = show ? L`Hide ignored findings` : L`Show ignored findings`;
        button.setAttribute('aria-pressed', String(show));
        if (show) this.resultsTree.append(this.#ignoredBranch.item);
        if (!show) this.#ignoredBranch.item.remove();
    }

    setExpanded(expanded) {
        this.inspectionPopup.close();
        const selector = 'sl-tree-item:has(> sl-tree-item)';
        const groups = this.resultsTree.querySelectorAll(selector);
        for (const group of groups) group.expanded = expanded;
    }

    render() {
        this.innerHTML = `<header>
            <strong>${L`Problems`}</strong>
            <output aria-live="polite"></output>
            <sl-icon-button name="arrow-clockwise" label="${L`Scan`}"
                data-click-action="scanProblems"></sl-icon-button>
            <sl-icon-button name="eye" label="${L`Show ignored findings`}"
                data-click-action="toggleIgnored" aria-pressed="false"></sl-icon-button>
            <sl-icon-button name="chevron-expand" label="${L`Expand all`}"
                data-click-action="expandProblems"></sl-icon-button>
            <sl-icon-button name="chevron-contract" label="${L`Collapse all`}"
                data-click-action="collapseProblems"></sl-icon-button>
            <sl-icon-button name="x-lg" label="${L`Close Problems`}"
                data-click-action="toggleProblems"></sl-icon-button>
        </header>
        <div class="problem-results">
            <sl-tree aria-label="${L`Problems`}"></sl-tree>
        </div>
        <cm-inspection-popup></cm-inspection-popup>`;
    }

    setProject(project) {
        this.inspectionPopup.close();
        this.#scanId++;
        this.#project = project;
        this.#results = null;
        this.#resultsBranch.tree.clear();
        this.#ignoredBranch.tree.clear();
        this.scanButton.disabled = false;
        this.setIgnoredVisible(false);
        this.updateCount();
        this.status.textContent = '';
        const removeDeleted = () => this.removeDeletedCards();
        this.watch('cards', project, 'cards', removeDeleted);
    }

    removeDeletedCards() {
        if (!this.#results) return;
        const cards = new Set(this.#project.cards);
        const removed = [...this.#results.keys()].filter(card => !cards.has(card));
        if (!removed.length) return;
        for (const card of removed) {
            this.#results.delete(card);
            this.showCard(card, []);
        }
        this.updateCount();
    }

    async scan() {
        const id = ++this.#scanId;
        this.scanButton.disabled = true;
        this.status.textContent = L`Scanning…`;
        try {
            await flushPendingCardSaves();
            if (id !== this.#scanId) return;
            const results = await this.collect(id);
            if (!results || id !== this.#scanId) return;
            this.#results = results;
            this.showResults();
            this.status.textContent = '';
        } catch (error) {
            report('scan', error);
            const message = L`Could not scan project.`;
            if (id === this.#scanId) this.status.textContent = message;
        } finally {
            if (id === this.#scanId) this.scanButton.disabled = false;
        }
    }

    async collect(id) {
        const project = this.#project;
        const game = window.activeGame;
        const scanned = game.cardInspector.inspectProject(project, true);
        const results = new Map();
        let deadline = performance.now() + CHUNK_TIME;
        for (const [card, items] of scanned) {
            const described = describeFindings(items, game.inspections);
            results.set(card, described.map(listedFinding));
            if (performance.now() < deadline) continue;
            await yieldToUI();
            if (id !== this.#scanId) return null;
            deadline = performance.now() + CHUNK_TIME;
        }
        return results;
    }

    updateCard({ project, card, findings }) {
        if (project !== this.#project || !this.#results?.has(card)) return;
        const listed = findings.map(listedFinding);
        this.#results.set(card, listed);
        this.showCard(card, listed);
        this.updateCount();
    }

    async openCard(card) {
        try {
            await executeAction('reveal-card', card);
        } catch (error) {
            report('openCard', error, [card]);
        }
    }

    openFinding(anchor, finding) {
        const scrollRegion = this.resultsRegion;
        this.inspectionPopup.open(anchor, [finding], { scrollRegion });
    }

    async applyFinding(finding, action) {
        this.inspectionPopup.close();
        try {
            await executeAction('reveal-card', finding.card);
            executeAction('apply-project-inspection', finding, action);
        } catch (error) {
            report('applyFinding', error, [finding.card]);
        }
    }

    showResults() {
        this.inspectionPopup.close();
        this.#resultsBranch.tree.clear();
        this.#ignoredBranch.tree.clear();
        for (const [card, findings] of this.#results)
            this.showCard(card, findings);
        this.updateCount();
    }

    showCard(card, findings) {
        this.#resultsBranch.tree.setCard(card, findings.filter(item => !item.ignored));
        this.#ignoredBranch.tree.setCard(card, findings.filter(item => item.ignored));
    }

    updateCount() {
        let total = 0;
        let ignored = 0;
        for (const findings of this.#results?.values() ?? []) {
            total += findings.length;
            ignored += findings.filter(item => item.ignored).length;
        }
        this.#resultsBranch.count.textContent = L`(${total - ignored})`;
        this.#ignoredBranch.count.textContent = L`(${ignored})`;
    }
}

customElements.define('cm-project-inspections', ProjectInspections);
