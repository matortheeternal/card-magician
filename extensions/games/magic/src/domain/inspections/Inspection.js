export default class Inspection {
    constructor({
        id, title, category, group = null, description = '', enabledByDefault = true
    }) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.group = group;
        this.description = description;
        this.enabledByDefault = enabledByDefault;
    }

    inspect() {
        return [];
    }
}
