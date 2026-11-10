import { hide, show } from '../../shared/htmlUtils.js';

const loadingContainer = document.querySelector('.loading-container');

export function showLoading() {
    loadingContainer.innerHTML = '<cm-loader></cm-loader>';
    show(loadingContainer);
}

export function showLoadingError() {
    loadingContainer.querySelector('cm-loader').showError();
}

export function hideLoading() {
    loadingContainer.innerHTML = '';
    hide(loadingContainer);
}
