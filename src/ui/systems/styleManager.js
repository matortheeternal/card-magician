const styles = {};

export function addStyle(key, css) {
    const style = styles[key] || document.createElement('style');
    style.textContent = css;
    if (!style.parentElement) document.body.appendChild(style);
    styles[key] = style;
}
