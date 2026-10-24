const items = [];

window.report = function(context) {
    return function (id, error, data) {
        items.push({ context, id, error, data });
    };
};
