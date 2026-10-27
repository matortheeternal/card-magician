import safeStringify from './thePrinter.js';

const items = [];
const subscribers = [];

window.createReporter = function(context) {
    return function (id, error, data) {
        const item = {
            context,
            id,
            error,
            data: safeStringify(data),
            timestamp: new Date()
        };
        items.push(item);
        publish(item);
    };
};

function publish(item) {
    for (const callback of subscribers) callback(item);
}

export function subscribe(callback) {
    subscribers.push(callback);
    for (const item of items) callback(item);
}

const recentErrors = new Set();

const fallbackReport = createReporter({
    unit: 'Fallback',
    label: 'Application'
});

function reportNewErrors(id, error, data) {
    const fingerprint = safeStringify([id, error, data]);
    if (recentErrors.has(fingerprint)) {
        console.error('Fallback error cycle detected:', error);
        return;
    }
    recentErrors.add(fingerprint);
    setTimeout(() => recentErrors.delete(fingerprint), 2500);
    fallbackReport(id, error, data);
}

window.addEventListener('unhandledrejection', event => {
    reportNewErrors('unhandled-rejection', event.reason, null);
});

window.addEventListener('error', event => {
    reportNewErrors('unhandled-error', event.error, {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
    });
});
