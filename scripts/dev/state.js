const state = {
    dirty: false,
    building: false,
    lastBuildOk: true,
    lastError: null
};

let start = null;

export function markDirty(path) {
    if (state.dirty) return;
    console.info(`change detected, build marked dirty > ${path}`);
    state.dirty = true;
}

export function startBuild() {
    console.log('start build');
    start = Date.now();
    state.building = true;
    state.lastError = null;
}

export function finishBuild(ok, error) {
    const duration = Date.now() - start;
    const status = ok ? 'completed successfully' : 'failed';
    console.log(`build ${status} (${duration}ms)`);

    state.building = false;
    state.lastBuildOk = ok;
    state.dirty = !ok;
    state.lastError = error ?? null;
}

export function getState() {
    return { ...state };
}
