import { forceSimulation } from 'd3-force';

export function createTooltipSimulation(tooltips) {
    const nodes = tooltips.map((tooltip, id) => {
        tooltip.cacheRect();
        const rect = tooltip.element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        return { id, tooltip, w: rect.width, h: rect.height, x, y };
    });

    const fixedNodes = tooltips
        .filter(tooltip => !tooltip.positionInsideEditable)
        .map(tooltip => {
            const rect = tooltip.editable.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            return { tooltip, w: rect.width, h: rect.height, x, y };
        });

    function forceTooltipCollide(padding = 2, strength = 2) {
        let nodes;

        function force() {
            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const ox = (a.w / 2 + b.w / 2 + padding) - Math.abs(dx);
                    const oy = (a.h / 2 + b.h / 2 + padding) - Math.abs(dy);

                    if (ox <= 0 || oy <= 0) continue;

                    if (ox < oy) {
                        const sx = dx < 0 ? -1 : 1;
                        const push = ox / 2;
                        a.x -= sx * push * strength;
                        b.x += sx * push * strength;
                    } else {
                        const sy = dy < 0 ? -1 : 1;
                        const push = oy / 2;
                        a.y -= sy * push * strength;
                        b.y += sy * push * strength;
                    }
                }
            }
        }

        force.initialize = _ => (nodes = _);
        return force;
    }

    function forceFixedCollide(padding = 2) {
        let nodes;

        const ownAnchorStrength   = 0.5;
        const otherAnchorStrength = 4;
        function force() {
            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                for (let j = 0; j < fixedNodes.length; j++) {
                    const b = fixedNodes[j];
                    const isOwnAnchor = b.tooltip === a.tooltip;
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const ox = (a.w / 2 + b.w / 2 + padding) - Math.abs(dx);
                    const oy = (a.h / 2 + b.h / 2 + padding) - Math.abs(dy);

                    if (ox <= 0 || oy <= 0) continue;

                    const strength = isOwnAnchor
                        ? ownAnchorStrength
                        : otherAnchorStrength;
                    if (ox < oy) {
                        const sx = dx < 0 ? -1 : 1;
                        const push = ox * strength / 2;
                        a.x -= sx * push;
                    } else {
                        const sy = dy < 0 ? -1 : 1;
                        const push = oy * strength / 2;
                        a.y -= sy * push;
                    }
                }
            }
        }

        force.initialize = _ => (nodes = _);
        return force;
    }

    function forceAnchor(strength = 0.04) {
        let nodes;
        function force() {
            for (const n of nodes) {
                const target = n.tooltip.editable.getBoundingClientRect();
                const tx = target.left + target.width / 2;
                const ty = target.bottom + 6;

                n.x += (tx - n.x) * strength;
                n.y += (ty - n.y) * strength;
            }
        }
        force.initialize = _ => (nodes = _);
        return force;
    }

    const sim = forceSimulation(nodes)
        .alpha(1)
        .alphaDecay(0.05)
        .velocityDecay(0.1)
        .force('collide', forceTooltipCollide(2))
        .force('fixedCollide', forceFixedCollide(2))
        .force('anchorForce', forceAnchor())
        .stop();

    let running = false;
    let rafId = null;

    function frame() {
        for (const n of nodes) {
            const el = n.tooltip.element;
            el.style.left = `${n.x - n.w / 2}px`;
            el.style.top = `${n.y - n.h / 2}px`;
        }

        sim.tick();
        sim.tick();

        if (running) rafId = requestAnimationFrame(frame);
    }

    return {
        start() {
            if (running) return;
            running = true;
            sim.alpha(1);
            frame();
        },
        stop() {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        }
    };
}
