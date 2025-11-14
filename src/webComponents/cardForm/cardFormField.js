export function esc(str) {
    return String(str ?? "").replace(/"/g, "&quot;");
}

function renderInput(field, face) {
    return (
        `<sl-input
          size="small"
          name="${esc(field.id)}"
          label="${esc(field.displayName)}"
          autocomplete="off"
          type="${field.inputType || 'text'}"
          value="${esc(face[field.id])}"
        ></sl-input>`
    );
}

function renderTextarea(field, face) {
    return (
        `<sl-textarea
          size="small"
          resize="auto"
          autocomplete="off"
          name="${esc(field.id)}"
          label="${esc(field.displayName)}"
          value="${esc(face[field.id])}"
          rows="2"
        ></sl-textarea>`
    );
}

function renderImage(field, face) {
    return (
        `<image-select size="small"
          name="${esc(field.id)}"
          label="${esc(field.displayName)}"
          src="${esc(face[field.id]?.image)}"
          filename="${esc(face[field.id]?.filename)}"
          crop-width="${esc(face[field.id]?.width)}"
          crop-height="${esc(face[field.id]?.height)}"
          crop-x="${esc(face[field.id]?.xOffset)}"
          crop-y="${esc(face[field.id]?.yOffset)}"
        ></image-select>`
    );
}

function renderSelect(field, face) {
    return (
        `<card-form-select 
          name="${esc(field.id)}"
          label="${esc(field.displayName)}" 
          value="${esc(face[field.id])}"
          data-field-id="${esc(field.id)}"
        ></card-form-select>`
    );
}

const fieldRenderers = {
    textarea: renderTextarea,
    select: renderSelect,
    image: renderImage,
    input: renderInput,
};

export function renderField(field, face) {
    const renderer = fieldRenderers[field.type || 'input'];
    if (!renderer) {
        console.error('Skippepd rendering unknown field type', field.type);
        return '';
    }
    return renderer(field, face);
}
