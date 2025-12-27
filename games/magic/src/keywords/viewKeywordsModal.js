import { baseKeywords } from "./lists/main.js";
const L = localize('game-magic');

export default class ViewKeywordsModal extends Modal {
    static id = 'cm-keywords-modal';
    title = L`Keywords`;

    onKeyup = { search: this.onSearch };
    onClick = { edit: (event) => {
            const keyword = JSON.parse(event.target.parentElement.dataset.keyword);
            const data = { game: this.data.game, set: this.data.set, keyword };
            this.data.game.openModal('cm-edit-keywords-modal', data);
        } 
    };

    baseRowHtml = `
        <div class="keyword-row label-row" id="label-row">
            <div class="keyword-row-label keyword-label">Label</div>
            <div class="keyword-row-label keyword-expression">Expression</div>
            <div class="keyword-row-label keyword-reminder-text">Reminder Text</div>
            <sl-input class="keyword-search" name="search" placeholder="Search keywords..." data-keyup-action="search"></sl-input>
            <sl-button class="new-keyword">+ New</sl-button>
        </div>
    `;

    css = `
        .keywords-table {
            display: flex;
            flex-direction: column;
            width: 90%;
            margin: auto;
        }

        .keyword-row {
            display: grid;
            /*grid-template-columns: 1fr 1.2fr 6fr 0.6fr;*/
            grid-template-columns: 0.6fr 1fr 1.2fr 6fr;
            border-bottom: 1px solid white;
            padding: 8px 0 8px 0;
            width: 100%;
            align-items: center;
        }

        .label-row {
            grid-template-columns: 1fr 1.2fr 1fr 5fr 0.6fr;
        }

        .keyword-label {
            font-weight: bold;
        }

        .keyword-label {
            justify-self: center;
        }

        .label-row {
            position: sticky;
            top: -7%;
            background: #111;
            padding-top: 12px;
            z-index: 2;
        }

        .keyword-param {
            color: #bd0052;
        }

        .new-keyword {
            margin-left: 8px;
        }
    `;

    bind() {
        super.bind();
        this.handleEvents('keyup', this.onKeyup);
    }

    renderTable() {
        let html = '';
        for (const keyword of baseKeywords) {
            html += this.keywordHtml(keyword);
        }

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
        const rt = row.querySelector('.keyword-label').innerText;
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
        return str.replaceAll(/<(.*?)>/g, '<span class="keyword-param">&lt;$1&gt;</span>')
    }

    keywordHtml(keyword) {
        return (`
            <div class="keyword-row" id="${keyword.label}-row" data-keyword="${JSON.stringify(keyword).replaceAll('"', '&quot;')}">
                <sl-button class="edit-keyword" data-click-action="edit">Edit</sl-button>
                <div class="keyword-label">${keyword.label}</div>
                <div class="keyword-expression">${this.escapeAndHighlight(keyword.expression)}</div>
                <div class="keyword-reminder-text">${this.escapeAndHighlight(keyword.reminderTexts[0].template)}</div>
            </div>
        `);
    }
}