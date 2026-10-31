import { subscribe } from '../reporting.js';
import ErrorReport from './ErrorReport.js';
import AsyncBatcher from './AsyncBatcher.js';
import { writeFile } from '../neutralinoAdapter.js';
import { beforeExit } from '../../lifecycle.js';

let sequentialId = 0;

async function writeBatch(batch) {
    const report = new ErrorReport(batch);
    const text = report.toMarkdown();
    const dateString = new Date().toISOString().replaceAll(':', '-');
    const filename = `errors-${dateString}-${sequentialId++}.md`;
    const filePath = NL_DATAPATH + '/errors/' + filename;
    await writeFile(filePath, text);
}

const batcher = new AsyncBatcher(writeBatch, {
    delay: 3000,
    maxItems: 10,
    onError: error => console.error('Error writing errors to disk: ', error),
});

export default function flushPending() {
    return batcher.flush();
}

subscribe(item => batcher.add(item));
beforeExit(flushPending, () => batcher.pending);
