export default class InspectionFinding {
    constructor(inspectionId, card, face, message, location = null, resolution = null) {
        this.inspectionId = inspectionId;
        this.card = card;
        this.face = face;
        this.message = message;
        this.location = location;
        this.resolution = resolution;
    }
}
