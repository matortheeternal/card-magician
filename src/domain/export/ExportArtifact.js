export default class ExportArtifact {
    /**
     * @abstract
     * Returns a Uint8Array or string to use when writing this artifact to disk.
     *
     * @returns {Promise<Uint8Array|string>}
     */
    async toBuffer() {
        throw new Error('Not implemented');
    }

    async hash(bytes) {
        return '';
    }
}

window.ExportArtifact = ExportArtifact;
