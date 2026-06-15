function useMobileLayout() {
    return window.innerWidth <= 900
        && window.matchMedia('(hover: none)').matches
        && window.matchMedia('(pointer: coarse)').matches;
}

export function applyDeviceLayout() {
    const classToAdd = useMobileLayout() ? 'layout-mobile' : 'layout-desktop';
    const classToRemove = useMobileLayout() ? 'layout-desktop' : 'layout-mobile';
    document.body.classList.add(classToAdd);
    document.body.classList.remove(classToRemove);
}
