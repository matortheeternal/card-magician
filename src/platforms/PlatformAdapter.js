/**
 * One entry returned by a directory listing.
 *
 * @typedef {object} DirectoryEntry
 * @property {string} entry
 *   Path relative to the requested directory, using forward slashes.
 * @property {string} path
 *   Entry path including the requested directory, using forward slashes.
 * @property {'DIRECTORY' | 'FILE'} type
 *   Directories use DIRECTORY; other entries, including symlinks, use FILE.
 */

/**
 * Metadata for a filesystem entry. The host follows symbolic links.
 *
 * @typedef {object} FileStats
 * @property {boolean} isFile Whether the target is a regular file.
 * @property {boolean} isDirectory Whether the target is a directory.
 * @property {number} size Size in bytes.
 * @property {number} createdAt Creation time in milliseconds since the Unix epoch.
 * @property {number} modifiedAt Modification time in milliseconds since the Unix epoch.
 */

/**
 * Syntactic path components parsed using the host platform's path rules.
 *
 * @typedef {object} PathParts
 * @property {string} parentPath Parent directory, or an empty string for a bare name.
 * @property {string} filename Final path component, including its extension.
 * @property {string} stem Final path component without its last extension.
 * @property {string} extension Last extension including its dot, or an empty string.
 */

/**
 * A named group of file extensions displayed in a native file dialog.
 *
 * @typedef {object} FileDialogFilter
 * @property {string} name User-facing label for the group.
 * @property {string[]} extensions Extensions without dots, or '*' for all files.
 */

/**
 * Options controlling directory enumeration.
 *
 * @typedef {object} DirectoryReadOptions
 * @property {boolean} [recursive=false] Whether to include descendants.
 */

/**
 * A JSON-compatible value stored in the current application's persistent storage.
 * Objects and arrays must not contain cycles, functions, or undefined values.
 *
 * @typedef {null | boolean | number | string | StoredDataValue[] |
 *     Object<string, StoredDataValue>} StoredDataValue
 */

/**
 * A file-watch failure serialized across the host boundary.
 *
 * @typedef {object} PlatformFileWatchError
 * @property {string} message Host error message.
 * @property {string} [code] Host error code when available.
 */

/**
 * Notification from a watch registered with startFileWatch().
 *
 * @typedef {object} PlatformFileChangeEvent
 * @property {string} id Identifier supplied when the watch was registered.
 * @property {'change' | 'delete' | 'error'} type Kind of notification.
 * @property {string} path Absolute path of the watched file.
 * @property {PlatformFileWatchError} [error] Failure details for error notifications.
 */

/**
 * Handles a close request. The host does not await the callback's return value.
 * Arrange pending work before explicitly terminating the application.
 *
 * @callback PlatformCloseHandler
 * @returns {void}
 */

/**
 * Handles a notification from any watch owned by the current renderer.
 *
 * @callback PlatformFileChangeHandler
 * @param {PlatformFileChangeEvent} event Notification including the watch identifier.
 * @returns {void}
 */

/**
 * Handles a file-open request delivered by the operating system or launch arguments.
 *
 * @callback PlatformOpenFileHandler
 * @param {string} filePath Absolute path requested by the host.
 * @returns {void}
 */

/**
 * Defines the renderer's host services for extension and application code.
 * CardMagicianGame.platform exposes the active host implementation. Subclasses
 * implement every operation; these base stubs throw synchronously if called.
 *
 * Filesystem operations resolve relative paths against appEnvironment.paths.content.
 * Path joining and parsing are purely syntactic and do not check existence.
 * Host operation failures reject their promises with an Error whose code may
 * identify the native failure. Event subscriptions and renderer-local operations
 * return synchronously unless their method contract states otherwise.
 *
 * @abstract
 */
export default class PlatformAdapter {
    /**
     * Appends one formatted log entry to the current application's app.log.
     *
     * @abstract
     * @param {string} level Log severity label.
     * @param {string} message Main message, including any caller-supplied context.
     * @param {any[]} args Additional values serialized as diagnostic details.
     * @returns {Promise<void>} Resolves after the entry is appended.
     * @throws {Error} Rejects if the log file cannot be written.
     */
    debugLog(level, message, args) {
        throw new Error('debugLog must be implemented');
    }

    /**
     * Opens an HTTP or HTTPS URL in the system's default browser.
     *
     * @abstract
     * @param {string} url Absolute web URL to open.
     * @returns {Promise<void>} Resolves when the host accepts the open request.
     * @throws {Error} Rejects for an invalid/unsupported URL or a launch failure.
     */
    openUrl(url) {
        throw new Error('openUrl must be implemented');
    }

    /**
     * Opens a file or directory with its system-associated application.
     *
     * @abstract
     * @param {string} path Absolute path, or a path relative to the content directory.
     * @returns {Promise<void>} Resolves when the host accepts the open request.
     * @throws {Error} Rejects if the system cannot open the target.
     */
    sysopen(path) {
        throw new Error('sysopen must be implemented');
    }

    /**
     * Launches a configured SVG editor with one literal filename argument.
     * The executable is launched directly without shell expansion. Completion does
     * not wait for the editor process to exit.
     *
     * @abstract
     * @param {string} executable Absolute path to the editor executable.
     * @param {string} filename
     *   SVG path, resolved against the content directory if relative.
     * @returns {Promise<void>} Resolves when the editor process has spawned.
     * @throws {Error} Rejects for a nonabsolute executable path or a launch failure.
     */
    openSvgEditor(executable, filename) {
        throw new Error('openSvgEditor must be implemented');
    }

    /**
     * Shows a native dialog for choosing one existing file.
     *
     * @abstract
     * @param {string} label Dialog title.
     * @param {FileDialogFilter[]} [filters] Allowed file-extension groups.
     * @returns {Promise<string | undefined>}
     *   Selected absolute path, or undefined when the user cancels.
     * @throws {Error} Rejects if the native dialog fails.
     */
    openSingleFileDialog(label, filters) {
        throw new Error('openSingleFileDialog must be implemented');
    }

    /**
     * Shows a native dialog for choosing one existing directory.
     *
     * @abstract
     * @param {string} label Dialog title.
     * @returns {Promise<string | undefined>}
     *   Selected absolute directory path, or undefined when the user cancels.
     * @throws {Error} Rejects if the native dialog fails.
     */
    openFolderDialog(label) {
        throw new Error('openFolderDialog must be implemented');
    }

    /**
     * Shows a native dialog for choosing a destination file.
     * This selects a path; it does not write the file.
     *
     * @abstract
     * @param {string} label Dialog title.
     * @param {string} defaultPath Suggested filename or initial destination path.
     * @param {FileDialogFilter[]} [filters] Allowed file-extension groups.
     * @returns {Promise<string | undefined>}
     *   Selected absolute path, or undefined when the user cancels.
     * @throws {Error} Rejects if the native dialog fails.
     */
    saveSingleFileDialog(label, defaultPath, filters) {
        throw new Error('saveSingleFileDialog must be implemented');
    }

    /**
     * Reads a value from the current application's persistent key-value store.
     * A missing key returns the string '{}', matching the configuration loader's
     * empty-object fallback; it does not return undefined.
     *
     * @abstract
     * @param {string} key Nonempty storage key.
     * @returns {Promise<StoredDataValue>}
     *   Stored JSON-compatible value or the missing-key fallback.
     * @throws {Error}
     *   Rejects for an invalid key, unreadable storage, or invalid stored JSON.
     */
    getStoredData(key) {
        throw new Error('getStoredData must be implemented');
    }

    /**
     * Persists a JSON-compatible value under one application storage key.
     * Existing data for the key is replaced. Objects are serialized; their identity
     * is not preserved across reads.
     *
     * @abstract
     * @param {string} key Nonempty storage key.
     * @param {StoredDataValue} value JSON-compatible data to persist.
     * @returns {Promise<void>} Resolves after the value is written.
     * @throws {Error}
     *  Rejects for an invalid key, serialization failure, or write failure.
     */
    storeData(key, value) {
        throw new Error('storeData must be implemented');
    }

    /**
     * Removes every key in the current application's persistent store.
     * Does not remove project files or other application data.
     *
     * @abstract
     * @returns {Promise<void>}
     *   Resolves after storage is removed; missing storage is harmless.
     * @throws {Error} Rejects if the storage directory cannot be removed.
     */
    clearStoredData() {
        throw new Error('clearStoredData must be implemented');
    }

    /**
     * Lists a directory's entries using forward-slash paths.
     * Recursive results keep each entry relative to the originally requested
     * folder. Result ordering is supplied by the host and is not guaranteed.
     *
     * @abstract
     * @param {string} filename Directory path to enumerate.
     * @param {DirectoryReadOptions} [options={}] Whether to include descendants.
     * @returns {Promise<DirectoryEntry[]>} Entries in the requested directory tree.
     * @throws {Error} Rejects if the path is missing, inaccessible or not a directory.
     */
    readDirectory(filename, options = {}) {
        throw new Error('readDirectory must be implemented');
    }

    /**
     * Reads an entire file as UTF-8 text.
     *
     * @abstract
     * @param {string} filename File path to read.
     * @returns {Promise<string>} Decoded file contents.
     * @throws {Error} Rejects if the file cannot be read.
     */
    readFile(filename) {
        throw new Error('readFile must be implemented');
    }

    /**
     * Writes UTF-8 text, replacing any existing file contents.
     * The Electron host creates missing parents and writes through a temporary
     * sibling before renaming it over the destination.
     *
     * @abstract
     * @param {string} filename Destination file path.
     * @param {string} data Complete replacement contents.
     * @returns {Promise<void>} Resolves after the replacement is written.
     * @throws {Error} Rejects if the destination cannot be written.
     */
    writeFile(filename, data) {
        throw new Error('writeFile must be implemented');
    }

    /**
     * Writes binary contents, replacing any existing file.
     * Uses the same parent-creation and replacement behavior as writeFile().
     *
     * @abstract
     * @param {string} filename Destination file path.
     * @param {ArrayBuffer | Uint8Array} data Complete replacement bytes.
     * @returns {Promise<void>} Resolves after the replacement is written.
     * @throws {Error} Rejects if the destination cannot be written.
     */
    writeBinaryFile(filename, data) {
        throw new Error('writeBinaryFile must be implemented');
    }

    /**
     * Reads an entire file without text decoding.
     *
     * @abstract
     * @param {string} filename File path to read.
     * @returns {Promise<ArrayBuffer>} File contents as a renderer-owned byte buffer.
     * @throws {Error} Rejects if the file cannot be read.
     */
    readBinaryFile(filename) {
        throw new Error('readBinaryFile must be implemented');
    }

    /**
     * Normalizes a path and resolves it against the content directory.
     * An already absolute path remains absolute. The target need not exist.
     *
     * @abstract
     * @param {string} filename Nonempty absolute or relative path.
     * @returns {Promise<string>} Normalized absolute path using host path separators.
     * @throws {Error} Rejects for an empty or nonstring path.
     */
    getAbsolutePath(filename) {
        throw new Error('getAbsolutePath must be implemented');
    }

    /**
     * Reads metadata for a filesystem entry, following symbolic links.
     *
     * @abstract
     * @param {string} filename File or directory path to inspect.
     * @returns {Promise<FileStats>} Entry metadata.
     * @throws {Error} Rejects if the target is missing or cannot be inspected.
     */
    getStats(filename) {
        throw new Error('getStats must be implemented');
    }

    /**
     * Checks whether a path resolves to a regular file.
     * Missing targets and paths beneath a nondirectory return false; other errors
     * are not treated as absence. Symbolic links are followed.
     *
     * @abstract
     * @param {string} filename File path to inspect.
     * @returns {Promise<boolean>} Whether the target exists and is a regular file.
     * @throws {Error} Rejects for invalid paths or other filesystem errors.
     */
    checkFileExists(filename) {
        throw new Error('checkFileExists must be implemented');
    }

    /**
     * Checks whether a path resolves to a directory.
     * Missing targets and paths beneath a nondirectory return false; other errors
     * are not treated as absence. Symbolic links are followed.
     *
     * @abstract
     * @param {string} filename Directory path to inspect.
     * @returns {Promise<boolean>} Whether the target exists and is a directory.
     * @throws {Error} Rejects for invalid paths or other filesystem errors.
     */
    checkFolderExists(filename) {
        throw new Error('checkFolderExists must be implemented');
    }

    /**
     * Joins and normalizes path segments using host path rules.
     * Does not resolve relative segments against the content directory or require
     * that any component exists.
     *
     * @abstract
     * @param {...string} parts Path segments in order.
     * @returns {Promise<string>} Joined path, or '.' when no segments are supplied.
     * @throws {Error} Rejects if a segment is not a string.
     */
    getJoinedPath(...parts) {
        throw new Error('getJoinedPath must be implemented');
    }

    /**
     * Parses a path without resolving it or accessing the filesystem.
     *
     * @abstract
     * @param {string} filename Path to parse using host path rules.
     * @returns {Promise<PathParts>} Directory, basename, stem, and final extension.
     * @throws {Error} Rejects if the path is not a string.
     */
    getPathParts(filename) {
        throw new Error('getPathParts must be implemented');
    }

    /**
     * Moves or renames a file or directory using the host filesystem.
     * The destination parent must exist. Overwrite and cross-device behavior
     * follow the host's rename operation.
     *
     * @abstract
     * @param {string} source Existing source path.
     * @param {string} destination New file or directory path.
     * @returns {Promise<void>} Resolves when the move completes.
     * @throws {Error} Rejects if the rename cannot be performed.
     */
    moveFile(source, destination) {
        throw new Error('moveFile must be implemented');
    }

    /**
     * Copies a file or recursively copies a directory.
     * Existing destination files may be overwritten under the host's copy rules.
     *
     * @abstract
     * @param {string} source Existing source file or directory path.
     * @param {string} destination Destination file or directory path.
     * @returns {Promise<void>} Resolves when copying completes.
     * @throws {Error} Rejects if the source cannot be read or the copy cannot be written.
     */
    copyFile(source, destination) {
        throw new Error('copyFile must be implemented');
    }

    /**
     * Creates a directory and any missing parent directories.
     * An existing directory is accepted without modification.
     *
     * @abstract
     * @param {string} filename Directory path to create.
     * @returns {Promise<string | undefined>}
     *   First directory created by the host, or undefined if no creation was needed.
     * @throws {Error} Rejects if an entry blocks creation or the path cannot be created.
     */
    createDirectory(filename) {
        throw new Error('createDirectory must be implemented');
    }

    /**
     * Removes a file or an entire directory tree recursively.
     * Missing targets are accepted. Callers must validate the target before using
     * this destructive operation.
     *
     * @abstract
     * @param {string} filename File or directory path to remove.
     * @returns {Promise<void>}
     *   Resolves after removal or when the target is already absent.
     * @throws {Error} Rejects if the target cannot be removed.
     */
    rmrf(filename) {
        throw new Error('rmrf must be implemented');
    }

    /**
     * Returns the syntactic parent directory of a path.
     * Does not resolve the path or inspect the filesystem.
     *
     * @abstract
     * @param {string} filename Path to parse using host path rules.
     * @returns {Promise<string>} Parent path, or an empty string for a bare filename.
     * @throws {Error} Rejects if the path is not a string.
     */
    getParentPath(filename) {
        throw new Error('getParentPath must be implemented');
    }

    /**
     * Returns a snapshot of the directories exposed through resource URLs.
     * Changing the returned object does not change the host's mount registry.
     *
     * @abstract
     * @returns {Promise<Object<string, string>>}
     *   Mapping from URL prefixes to absolute filesystem paths.
     */
    getMounts() {
        throw new Error('getMounts must be implemented');
    }

    /**
     * Exposes a filesystem directory through an application resource URL.
     * Replaces any existing mapping for the prefix. The Electron resource server
     * rejects requests that escape the directory, including escaping symlinks.
     *
     * @abstract
     * @param {string} path Single-segment URL prefix such as '/project'.
     *   May contain letters, digits, underscores, and hyphens after the initial slash.
     * @param {string} target Directory path, relative to the content directory if needed.
     * @returns {Promise<void>} Resolves after the mapping is registered.
     * @throws {Error} Rejects for an invalid prefix or target path.
     */
    mount(path, target) {
        throw new Error('mount must be implemented');
    }

    /**
     * Removes a resource URL mapping without deleting filesystem contents.
     * An unregistered prefix is accepted without error.
     *
     * @abstract
     * @param {string} path URL prefix previously supplied to mount().
     * @returns {Promise<void>} Resolves after the mapping is removed.
     */
    unmount(path) {
        throw new Error('unmount must be implemented');
    }

    /**
     * Writes text to the host process's standard output without adding a newline.
     *
     * @abstract
     * @param {string} data Text to write, including any desired line terminator.
     * @returns {Promise<void>} Resolves when the host has submitted the write.
     * @throws {Error} Rejects if the host cannot submit the write.
     */
    writeProcessOutput(data) {
        throw new Error('writeProcessOutput must be implemented');
    }

    /**
     * Writes text to the host process's standard error without adding a newline.
     *
     * @abstract
     * @param {string} data Text to write, including any desired line terminator.
     * @returns {Promise<void>} Resolves when the host has submitted the write.
     * @throws {Error} Rejects if the host cannot submit the write.
     */
    writeProcessError(data) {
        throw new Error('writeProcessError must be implemented');
    }

    /**
     * Requests immediate application termination with an exit status.
     * Does not flush pending renderer saves. Normal application shutdown should
     * use the lifecycle coordinator before invoking this operation.
     *
     * @abstract
     * @param {number} [code=0] Integer process exit status.
     * @returns {Promise<void>}
     *   Resolves when the host accepts the request; termination may prevent resumption.
     * @throws {Error} Rejects if the status is not an integer.
     */
    terminateApp(code = 0) {
        throw new Error('terminateApp must be implemented');
    }

    /**
     * Installs the close-request callback and enables host close notifications.
     * In Electron, a new registration replaces the previous close callback. The
     * host keeps the window open until terminateApp() is explicitly requested;
     * completion of the callback itself does not close the window.
     *
     * @abstract
     * @param {PlatformCloseHandler} callback
     *   Handler responsible for coordinating shutdown.
     * @returns {Promise<void>}
     *   Resolves after the handler is installed and the host is ready.
     */
    onWindowClose(callback) {
        throw new Error('onWindowClose must be implemented');
    }

    /**
     * Reloads the renderer immediately without flushing pending work.
     * Callbacks and file watches owned by the old renderer are discarded.
     *
     * @abstract
     * @returns {void} Requests navigation; the caller's renderer is replaced.
     */
    reloadApp() {
        throw new Error('reloadApp must be implemented');
    }

    /**
     * Restores the window from maximized and resizes it to its minimum width,
     * keeping its restored height, then centers it on screen.
     *
     * @abstract
     * @returns {Promise<void>} Resolves after the host applies the new bounds.
     */
    compactWindow() {
        throw new Error('compactWindow must be implemented');
    }

    /**
     * Maximizes the window. Already maximized windows are left unchanged.
     *
     * @abstract
     * @returns {Promise<void>} Resolves after the host requests maximization.
     */
    maximizeWindow() {
        throw new Error('maximizeWindow must be implemented');
    }

    /**
     * Starts watching one file after host metadata changes settle for 250 ms.
     * The parent directory must exist; the file itself may initially be absent.
     * Reports changes, deletion, recreation, and errors without an initial event.
     * Use onFileChange() to receive notifications and filter them by identifier.
     * Watches are released when the renderer navigates, crashes, or closes.
     *
     * @abstract
     * @param {string} id Nonempty identifier unique among this renderer's active watches.
     * @param {string} filename Absolute or content-relative file path to watch.
     * @returns {Promise<void>} Resolves when the watch's initial state has been read.
     * @throws {Error} Rejects for duplicate/invalid identifiers or watch setup failures.
     */
    startFileWatch(id, filename) {
        throw new Error('startFileWatch must be implemented');
    }

    /**
     * Stops a file watch and cancels its pending settling timer.
     * Unknown identifiers are accepted. This does not remove onFileChange()
     * listeners; those have their own unsubscribe functions.
     *
     * @abstract
     * @param {string} id Identifier supplied to startFileWatch().
     * @returns {Promise<void>} Resolves after the watch is stopped.
     */
    stopFileWatch(id) {
        throw new Error('stopFileWatch must be implemented');
    }

    /**
     * Subscribes to notifications from all of this renderer's file watches.
     * Registration does not create a watch. Multiple listeners may be installed;
     * each callback must filter events for its own watch identifier.
     *
     * @abstract
     * @param {PlatformFileChangeHandler} callback
     *   Handler receiving each watch notification.
     * @returns {function(): void} Removes only this listener when invoked.
     */
    onFileChange(callback) {
        throw new Error('onFileChange must be implemented');
    }

    /**
     * Signals that renderer startup has finished and file-open requests can be delivered.
     * Register onOpenFile() before signaling readiness to receive queued requests.
     *
     * @abstract
     * @returns {void} Sends the readiness notification without waiting for a reply.
     */
    ready() {
        throw new Error('ready must be implemented');
    }

    /**
     * Subscribes to host file-open requests for this renderer's lifetime.
     * Each registration adds a listener. The host delivers queued launch requests
     * after ready(); the subscription does not provide an unsubscribe operation.
     *
     * @abstract
     * @param {PlatformOpenFileHandler} callback
     *   Handler receiving each absolute file path.
     * @returns {void} Registers the listener synchronously.
     */
    onOpenFile(callback) {
        throw new Error('onOpenFile must be implemented');
    }
}
