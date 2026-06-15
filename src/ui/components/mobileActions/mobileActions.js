import ReactiveComponent from '../ReactiveComponent.js';
import mobileActionsHtml from './mobileActions.html.js';
import { popAllStates, popState } from '../../systems/navigationSystem.js';
import { show, hide } from '../../../shared/htmlUtils.js';

export default class MobileActions extends ReactiveComponent {
    showingMenu = false;

    connectedCallback() {
        this.render();
        this.bind();
    }

    bind() {
        this.addEventListener('click', e => this.closeMenu(e));
        this.handleEvents('click', {
            back: () => this.onBackClick(),
            home: () => this.onHomeClick(),
            menu: () => this.onMenuClick(),
        });
    }

    onBackClick() {
        log('user').info('Back touch');
        popState();
    }

    onHomeClick() {
        log('user').info('Home touch');
        popAllStates();
    }

    onMenuClick() {
        log('user').info('Menu touch');
        this.showingMenu = true;
        show(this.mobileMenu);
    }

    closeMenu(e) {
        if (!this.showingMenu) return;
        this.showingMenu = false;
        hide(this.mobileMenu);
        e.stopImmediatePropagation();
    }

    renderMenu() {
        this.mobileMenu = document.createElement('cm-mobile-menu');
        this.mobileMenu.addEventListener('click', e => this.closeMenu(e));
        hide(this.mobileMenu);
        document.body.prepend(this.mobileMenu);
    }

    render() {
        this.innerHTML = mobileActionsHtml;
        this.renderMenu();
    }
}

customElements.define('cm-mobile-actions', MobileActions);
