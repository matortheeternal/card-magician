const EDGE_TOLERANCE = 4;

export default function inspectionHoverBridge(origin, popup) {
    const edge = origin.y < popup.top ? popup.top : popup.bottom;
    if (origin.y >= popup.top && origin.y <= popup.bottom) return null;
    return point => {
        const progress = (point.y - origin.y) / (edge - origin.y);
        if (progress < 0 || progress > 1) return false;
        const left = origin.x + (popup.left - origin.x) * progress - EDGE_TOLERANCE;
        const right = origin.x + (popup.right - origin.x) * progress + EDGE_TOLERANCE;
        return point.x >= left && point.x <= right;
    };
}
