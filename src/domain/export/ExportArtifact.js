import { getJoinedPath } from '../../shared/platformAdapter.js';

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

    /**
     * @param folder
     * @param localPath
     * @returns {string}
     */
    async getExportFilePath(folder, localPath) {
        return getJoinedPath(
            activeProject.folderPath,
            'dist',
            folder,
            localPath
        );
    }
}

window.ExportArtifact = ExportArtifact;
