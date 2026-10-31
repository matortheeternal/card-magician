import { debugLog } from './platformAdapter.js';

const isDebugMode = appEnvironment.args.includes('--debug');
const log = [];
const loggers = {};
const logGroups = {};
const t0 = new Date();

export function getLogMessages(since = t0) {
    return log.filter(msg => msg.timestamp >= since);
}

export function addLogGroup(groupKey, color) {
    logGroups[groupKey] = { color };
}

function logMessage(level, groupKey, message, ...args) {
    const timestamp = new Date();
    const colorExpr = `color: ${logGroups[groupKey]?.color ?? 'inherit'}`;
    console[level](`%c[${groupKey}] ${message}`, colorExpr, ...args);
    if (level === 'debug' && !isDebugMode) return;
    log.push({ level, groupKey, message, args, timestamp });
    debugLog(level, `[${groupKey}] ${message}`, args).catch(() => {});
}

window.log = function(groupKey) {
    return loggers[groupKey] ??= {
        debug: (msg, ...args) => logMessage('debug', groupKey, msg, ...args),
        info:  (msg, ...args) => logMessage('info',  groupKey, msg, ...args),
        warn:  (msg, ...args) => logMessage('warn',  groupKey, msg, ...args),
        error: (msg, ...args) => logMessage('error', groupKey, msg, ...args),
    };
};

addLogGroup('startup', 'goldenrod');
addLogGroup('fs',      'coral');
addLogGroup('cache',   'grey');
addLogGroup('user',    'khaki');
addLogGroup('render',  'turquoise');
addLogGroup('state',   'violet');
addLogGroup('export',  'black');
addLogGroup('plugin',  'lightgreen');
