import {
    getSelectionCollapsed, setCursorPosition,
    getSelectionRange, getAnchorOffset
} from './htmlSelectionSystem.js';

function afterNextDomMutation(element, callback) {
    const wrapped = () => {
        callback();
        element.removeEventListener('dom-morphed', wrapped);
    };
    element.addEventListener('dom-morphed', wrapped);
}

export function edit(element, textToInsert = '', startOffset = 0, endOffset = 0) {
    const [start, end] = getSelectionRange(element);
    const collapsed = start === end;
    const initialValue = element.value;
    const [sliceTo, sliceFrom] = collapsed
        ? [
            Math.max(start - startOffset, 0),
            Math.min(end + endOffset, initialValue.length)
        ]
        : [start, end];
    return [
        initialValue.slice(0, sliceTo),
        textToInsert,
        initialValue.slice(sliceFrom)
    ].join('');
}

function handlePaste(event, element) {
    if (event.inputType !== 'insertFromPaste') return;
    event.preventDefault();
    const text = (event.dataTransfer
        ? event.dataTransfer.getData('text/plain')
        : event.data).trim();
    if (!text) return true;
    element.value = edit(element, text);
    const newOffset = getAnchorOffset(element) + text.length;
    afterNextDomMutation(element, () => setCursorPosition(element, newOffset));
    return true;
}

function handleDeleteContentBackward(event, element) {
    if (event.inputType !== 'deleteContentBackward') return;
    event.preventDefault();
    const diff = getSelectionCollapsed(element) ? 1 : 0;
    element.value = edit(element, '', 1);
    const newOffset = getAnchorOffset(element) - diff;
    afterNextDomMutation(element, () => setCursorPosition(element, newOffset));
    return true;
}

function handleDeleteContentForward(event, element) {
    if (event.inputType !== 'deleteContentForward') return;
    event.preventDefault();
    element.value = edit(element, '', 0, 1);
    return true;
}

function handleLineBreakOrParagraph(event) {
    if (event.inputType !== 'insertLineBreak' &&
        event.inputType !== 'insertParagraph') return;
    event.preventDefault();
    return true;
}

function handleInsertText(event, element) {
    if (event.inputType !== 'insertText') return;
    event.preventDefault();
    element.value = edit(element, event.data);
    const newOffset = getAnchorOffset(element) + event.data.length;
    afterNextDomMutation(element, () => setCursorPosition(element, newOffset));
    return true;
}

export function onBeforeInput(event, element) {
    if (event.isComposing) return;
    return handlePaste(event, element)
        || handleDeleteContentBackward(event, element)
        || handleDeleteContentForward(event, element)
        || handleLineBreakOrParagraph(event, element)
        || handleInsertText(event, element);
}
