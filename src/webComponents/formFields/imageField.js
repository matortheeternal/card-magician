import FieldElement from './fieldElement.js';
import { esc } from '../../utils.js';
import { registerField } from '../../services/fieldElementRegistry.js';

export default class ImageField extends FieldElement {
    static tagName = 'cm-image-select';
    eventKey = 'change';

    static matches(field) {
        return field.type === 'image';
    }

    render() {
        if (!this.field) return;
        this.innerHTML = (
            `<image-select size="small"
              name="${esc(this.field.id)}"
              label="${esc(this.field.label)}"
              src="${esc(this.value?.imageUrl)}"
              filename="${esc(this.value?.filename)}"
              crop-width="${this.value?.width}"
              crop-height="${esc(this.value?.height)}"
              crop-x="${esc(this.value?.xOffset)}"
              crop-y="${esc(this.value?.yOffset)}"
            ></image-select>`
        );
    }

    getChangedValue(event) {
        return event.detail?.value || this.value;
    }
}

registerField(ImageField);
