function formatNumber(value) {
    return Number(value.toFixed(4)).toString();
}

function formatPoint(point) {
    return `${formatNumber(point.x)} ${formatNumber(point.y)}`;
}

function createOrigin(layer) {
    return `M ${formatPoint(layer.points[0].position)}`;
}

function addVectors(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    };
}

function createCurveSegment(current, next) {
    const control1 = addVectors(current.position, current.handleAfter);
    const control2 = addVectors(next.position, next.handleBefore);
    return [
        'C',
        formatPoint(control1),
        formatPoint(control2),
        formatPoint(next.position)
    ].join(' ');
}

function createLineSegment(current, next) {
    return `L ${formatPoint(next.position)}`;
}

function createSegments(points) {
    const segments = [];
    for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i + 1) % points.length];
        const segment = current.lineAfter === 'curve'
            ? createCurveSegment(current, next)
            : createLineSegment(current, next);
        segments.push(segment);
    }
    return segments;
}

function shapeToPathData(layer) {
    if (!layer.points.length) return '';
    return [
        createOrigin(layer),
        ...createSegments(layer.points),
        'Z'
    ].join(' ');
}

export default function convertToSVG(layer) {
    const pathData = shapeToPathData(layer);
    return `<path id="${layer.id}" d="${pathData}" />`;
}
