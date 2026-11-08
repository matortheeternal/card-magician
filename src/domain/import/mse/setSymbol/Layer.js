import convertToSVG from './svgConverter.js';

const POINT_COORDINATES_PATTERN = /\((-?[0-9.]+),(-?[0-9.]+)\)/;

function parseCoords(str) {
    if (!str) return null;
    const match = str.match(POINT_COORDINATES_PATTERN);
    return {
        x: parseFloat(match[1]) * 100,
        y: parseFloat(match[2]) * 100
    };
}

function parsePoint(point) {
    return {
        ...point,
        position: parseCoords(point.position),
        lineAfter: point.line_after,
        handleBefore: parseCoords(point.handle_before),
        handleAfter: parseCoords(point.handle_after)
    };
}

function parsePoints(point) {
    if (!point) return [];
    const points = Array.isArray(point) ? point : [point];
    return points.map(parsePoint);
}

export default class Layer {
    constructor({ type, name, combine, point }, index) {
        this.index = index + 1;
        this.type = type;
        this.name = name;
        this.combine = combine;
        this.points = parsePoints(point);
    }

    get maskColor() {
        if (this.combine === 'subtract') return 'black';
        return 'white';
    }

    get fillMask() {
        return convertToSVG(this);
    }
}
