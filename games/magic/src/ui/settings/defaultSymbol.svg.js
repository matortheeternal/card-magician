export default
`<svg class="set-icon" viewBox="0 0 100 100" width="24" height="24" role="img">
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop class="g1" offset="0%" stop-color="black"/>
            <stop class="g2" offset="45%" stop-color="black"/>
            <stop class="g3" offset="55%" stop-color="black"/>
            <stop class="g4" offset="100%" stop-color="black"/>
        </linearGradient>
    </defs>

    <rect
        class="outer"
        x="20"
        y="20"
        width="60"
        height="60"
        rx="4"
        ry="4"
        fill="url(#grad)"
        stroke="var(--rar-stroke-outer)"
        stroke-width="5"
    />
</svg>`;
