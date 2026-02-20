export default function drawListMarker(ctx, node, style, rootRect) {
    const rect = node.getBoundingClientRect();
    ctx.save();

    const x = rect.left - rootRect.left - 0.6 * parseFloat(style.fontSize);
    const y = rect.top - rootRect.top + parseFloat(style.fontSize) / 2;
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.fillStyle = style.color;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('•', x, y);

    ctx.restore();
}
