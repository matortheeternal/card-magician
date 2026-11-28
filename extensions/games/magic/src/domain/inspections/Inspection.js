export default class Inspection {
    constructor({
        id, title, category, group = null, description = '', enabledByDefault = true,
        field = null, resolution = null
    }) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.group = group;
        this.description = description;
        this.field = field;
        this.resolution = resolution;
        this.enabledByDefault = enabledByDefault;
    }

    inspect() {
        return [];
    }
}
