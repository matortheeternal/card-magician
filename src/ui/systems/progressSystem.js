const progressEndpoints = [];

export function registerProgressEndpoint(progressEndpoint) {
    progressEndpoints.push(progressEndpoint);
    return () => progressEndpoints.remove(progressEndpoint);
}

export function setStatus(status) {
    progressEndpoints.forEach(endpoint => {
        endpoint.setStatus(status);
    });
}

export function setOperation(operation) {
    progressEndpoints.forEach(endpoint => {
        endpoint.setOperation(operation);
    });
}

export function setMax(max) {
    progressEndpoints.forEach(endpoint => {
        endpoint.setMax(max);
    });
}

export function increment(value = 1) {
    progressEndpoints.forEach(endpoint => {
        endpoint.incrementProgress(value);
    });
}

export function setTitle(title) {
    progressEndpoints.forEach(endpoint => {
        endpoint.setTitle(title);
    });
}

export function complete() {
    progressEndpoints.forEach(endpoint => {
        endpoint.complete();
    });
}

export function onError(error) {
    progressEndpoints.forEach(endpoint => {
        endpoint.onError(error);
    });
}
