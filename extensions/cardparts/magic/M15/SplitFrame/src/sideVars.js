export default function sideVars(side, vars) {
    const style = {};
    for (const { style: varStyle } of vars) {
        for (const [name, value] of Object.entries(varStyle))
            style[name.replace('--', `--${side}-`)] = value;
    }
    return style;
}
