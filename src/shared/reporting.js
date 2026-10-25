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
