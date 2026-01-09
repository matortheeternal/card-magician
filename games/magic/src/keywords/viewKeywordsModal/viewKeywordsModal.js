import { getKeywords } from '../lists/main.js';
import css from './viewKeywordsModal.css';

const L = localize('game-magic');

export default class ViewKeywordsModal extends Modal {
    static id = 'cm-view-keywords-modal';
    title = L`Keywords`;
    css = css;

    onKeyup = { search: this.onSearch };
    get onClickHandlers() {
        return {   
            ...super.onClickHandlers,
            edit: this.editKeyword,
            newKeyword: this.newKeyword
        };
    }

    editKeyword(event) {
        const keyword = JSON.parse(event.target.parentElement.dataset.keyword);
        if (keyword.isCustom) 
            keyword.saveIndex =  this.data.set.userKeywords.indexOf(keyword);

        const data = { game: this.data.game, set: this.data.set, keyword };
        this.data.game.openModal('cm-edit-keywords-modal', data);
    }

    newKeyword() {
        const keyword = {
            label: L`New Keyword`,
            expression: '',
            user: true,
            saveIndex: this.data.set.userKeywords.length,
            reminderTexts: [
                {
                    template: ''
                }
            ]
        };
        this.data.set.userKeywords.push(keyword);

        const data = { game: this.data.game, set: this.data.set, keyword };
        this.data.game.openModal('cm-edit-keywords-modal', data);
    }

    baseRowHtml = `
        <div class="keyword-row label-row" id="label-row">
            <div class="keyword-row-label keyword-label">Label</div>
            <div class="keyword-row-label keyword-expression">Expression</div>
            <div class="keyword-row-label keyword-reminder-text">Reminder Text</div>
            <sl-input class="keyword-search" name="search" 
                placeholder="Search keywords..." data-keyup-action="search"></sl-input>
            <sl-button class="new-keyword" data-click-action="newKeyword">
                <sl-icon slot="prefix" name="plus-lg"></sl-icon>
                New Keyword
            </sl-button>
            <div class="keyword-row-label keyword-actions">Actions</div>
        </div>
    `;

    bind() {
        super.bind();
        this.handleEvents('keyup', this.onKeyup);
    }

    renderTable() {
        let html = '';
        for (const keyword of getKeywords(this.data.set))
            html += this.keywordHtml(keyword);
        

        return html;
    }

    onSearch() {
        const tableRows = document.querySelectorAll('.keyword-row:not(.label-row)');
        tableRows.forEach((row) => {
            row.style.display = this.isSearched(row) ? 'grid' : 'none';
        });
    }

    isSearched(row) {
        const label = row.querySelector('.keyword-label').innerText;
        const expression = row.querySelector('.keyword-expression').innerText;
        const rt = row.querySelector('.keyword-reminder-text').innerText;
        const searchTerms = document.querySelector('.keyword-search').value.split(' ');

        if (searchTerms.length === 0) return true;

        for (const term of searchTerms) {
            const match = new RegExp(term, 'i');
            if (label.match(match) || expression.match(match) || rt.match(match)) 
                return true;
        }

        return false;
    }

    renderBody() {
        return (`
            <div class="keywords-table">
                ${this.baseRowHtml}
                ${this.renderTable()}
            </div>
            <style>${this.css}</style>
        `);
    }

    escapeAndHighlight(str) {
        return str.replaceAll(
            /<(.*?)>/g, 
            '<span class="keyword-param">&lt;$1&gt;</span>'
        );
    }

    keywordHtml(keyword) {
        const rt = keyword.reminderTexts[0].template;
        const rtTemplateHtml = this.escapeAndHighlight(rt);
        const rtExpressionHtml = this.escapeAndHighlight(keyword.expression);

        return (`
            <div class="keyword-row" id="${keyword.label}-row" 
                data-keyword="${JSON.stringify(keyword).replaceAll('"', '&quot;')}">
                <div class="keyword-label">${keyword.label}</div>
                <div class="keyword-expression">${rtExpressionHtml}</div>
                <div class="keyword-reminder-text">${rtTemplateHtml}</div>
                <sl-button class="edit-keyword" data-click-action="edit">
                    <sl-icon slot="prefix" name="pencil"></sl-icon>
                    Edit
                </sl-button>
            </div>
        `);
    }
}