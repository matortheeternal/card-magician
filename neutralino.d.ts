export declare enum LoggerType {
	WARNING = "WARNING",
	ERROR = "ERROR",
	INFO = "INFO"
}
export declare enum Icon {
	WARNING = "WARNING",
	ERROR = "ERROR",
	INFO = "INFO",
	QUESTION = "QUESTION"
}
export declare enum MessageBoxChoice {
	OK = "OK",
	OK_CANCEL = "OK_CANCEL",
	YES_NO = "YES_NO",
	YES_NO_CANCEL = "YES_NO_CANCEL",
	RETRY_CANCEL = "RETRY_CANCEL",
	ABORT_RETRY_IGNORE = "ABORT_RETRY_IGNORE"
}
export declare enum ClipboardFormat {
	unknown = "unknown",
	text = "text",
	image = "image"
}
export declare enum Mode {
	window = "window",
	browser = "browser",
	cloud = "cloud",
	chrome = "chrome"
}
export declare enum OperatingSystem {
	Linux = "Linux",
	Windows = "Windows",
	Darwin = "Darwin",
	FreeBSD = "FreeBSD",
	Unknown = "Unknown"
}
export declare enum Architecture {
	x64 = "x64",
	arm = "arm",
	itanium = "itanium",
	ia32 = "ia32",
	unknown = "unknown"
}
export declare enum SendKeyState {
	press = "press",
	down = "down",
	up = "up"
}
export declare enum NetworkFamily {
	ipv4 = "ipv4",
	ipv6 = "ipv6"
}
export declare enum AccessMode {
	F_OK = 0,
	R_OK = 4,
	W_OK = 2,
	X_OK = 1
}
export interface DirectoryEntry {
	entry: string;
	path: string;
	type: string;
}
export interface FileReaderOptions {
	pos: number;
	size: number;
}
export interface DirectoryReaderOptions {
	recursive: boolean;
}
export interface OpenedFile {
	id: number;
	eof: boolean;
	pos: number;
	lastRead: number;
}
export interface Stats {
	size: number;
	isFile: boolean;
	isDirectory: boolean;
	createdAt: number;
	modifiedAt: number;
}
export interface Watcher {
	id: number;
	path: string;
}
export interface CopyOptions {
	recursive: boolean;
	overwrite: boolean;
	skip: boolean;
}
export interface PathParts {
	rootName: string;
	rootDirectory: string;
	rootPath: string;
	relativePath: string;
	parentPath: string;
	filename: string;
	stem: string;
	extension: string;
}
interface Permissions$1 {
	all: boolean;
	ownerAll: boolean;
	ownerRead: boolean;
	ownerWrite: boolean;
	ownerExec: boolean;
	groupAll: boolean;
	groupRead: boolean;
	groupWrite: boolean;
	groupExec: boolean;
	othersAll: boolean;
	othersRead: boolean;
	othersWrite: boolean;
	othersExec: boolean;
}
export type PermissionsMode = "ADD" | "REPLACE" | "REMOVE";
/**
 * Creates a directory or multiple directories recursively. Throws `NE_FS_DIRCRER` if directory creation is not possible.
 *
 * @param path - New directory path.
 */
declare function createDirectory(path: string): Promise<void>;
/**
 * Removes a directory or file. If the given path is a directory, this function recursively removes all contents of the specific directory. Throws `NE_FS_REMVERR` if the removal is not possible.
 *
 * @param path - Directory or file path.
 */
declare function remove(path: string): Promise<void>;
/**
 * Writes a text file. Throws `NE_FS_FILWRER` for file write errors.
 *
 * @param path - Filename.
 * @param data - Content of the file.
 */
declare function writeFile(path: string, data: string): Promise<void>;
/**
 * Appends text content to file. Throws `NE_FS_FILWRER` for file write errors. If the provided file doesn't exist, this function creates a new file with `data`.
 *
 * @param path - Filename.
 * @param data - Content to append.
 */
declare function appendFile(path: string, data: string): Promise<void>;
/**
 * Writes a binary file. Throws `NE_FS_FILWRER` for file write errors.
 *
 * @param path - Filename.
 * @param data - Content of the binary file as an ArrayBuffer.
 */
declare function writeBinaryFile(path: string, data: ArrayBuffer): Promise<void>;
/**
 * Appends binary data to a file. Throws `NE_FS_FILWRER` for file write errors. If the provided file doesn't exist, this function creates a new file with `data`.
 *
 * @param path - Filename.
 * @param data - Binary content to append as an ArrayBuffer.
 */
declare function appendBinaryFile(path: string, data: ArrayBuffer): Promise<void>;
/**
 * Reads a text file. Throws `NE_FS_FILRDER` for file read errors.
 *
 * @param path - Filename.
 * @param options - Options.
 * @param options.pos - File cursor position in bytes.
 * @param options.size - File reader buffer size in bytes.
 */
declare function readFile(path: string, options?: FileReaderOptions): Promise<string>;
/**
 * Reads binary files. Throws `NE_FS_FILRDER` for file read errors.
 *
 * @param path - Filename.
 * @param options - Options.
 * @param options.pos - File cursor position in bytes.
 * @param options.size - File reader buffer size in bytes.
 */
declare function readBinaryFile(path: string, options?: FileReaderOptions): Promise<ArrayBuffer>;
/**
 * Creates a readable file stream. Throws `NE_FS_FILOPER` for file open errors.
 *
 * @param path - Filename.
 */
declare function openFile(path: string): Promise<number>;
/**
 * Creates a filesystem watcher for a specific directory path. Throws `NE_FS_UNLCWAT` for watcher creation failures. If there is an existing active watcher for the given path, this function returns the existing watcher identifier.
 *
 * @param path - Directory path.
 */
declare function createWatcher(path: string): Promise<number>;
/**
 * Removes a filesystem watcher. Throws `NE_FS_NOWATID` for watcher removal failures.
 *
 * @param id - File watcher identifier.
 */
declare function removeWatcher(id: number): Promise<number>;
/**
 * Returns information about created file watchers.
 */
declare function getWatchers(): Promise<Watcher[]>;
/**
 * Invokes file stream actions. Throws `NE_FS_UNLTOUP` if the framework can't update the stream. Call this method to read and seek an opened file (aka a readable stream).
 *
 * @param id - File stream identifier.
 * @param event - An action to take. Accepts only the following values:
 * @param data - Additional data for the action. Send the buffer size in bytes (default: 256 bytes) if the action is read, readBinary, readAll, or readAllBinary. Send the file stream cursor position if the action is seek.
 */
declare function updateOpenedFile(id: number, event: string, data?: any): Promise<void>;
/**
 * Returns file stream details. Throws `NE_FS_UNLTFOP` if the file stream identifier is not valid.
 *
 * @param id - File stream identifier.
 */
declare function getOpenedFileInfo(id: number): Promise<OpenedFile>;
/**
 * Reads directory contents. Throws `NE_FS_NOPATHE` if the path doesn't exist.
 *
 * @param path - File/directory path.
 * @param options - Options.
 * @param options.recursive - Read sub-directories recursively. The default value is false.
 */
declare function readDirectory(path: string, options?: DirectoryReaderOptions): Promise<DirectoryEntry[]>;
/**
 * Copies a file or directory to a new destination. Throws `NE_FS_COPYERR` if the system cannot copy the path.
 *
 * @param source - Source path.
 * @param destination - Destination path.
 * @param options - Options.
 * @param options.recursive - Copy sub-directories recursively. The default value is true.
 * @param options.overwrite - Overwrite an existing file with the same name. The default value is true.
 * @param options.skip - Skip an existing file with the same name. The default value is false.
 */
declare function copy(source: string, destination: string, options?: CopyOptions): Promise<void>;
/**
 * Moves a file or directory to a new destination. Throws `NE_FS_MOVEERR` if the system cannot rename the path.
 *
 * @param source - Source path.
 * @param destination - Destination path.
 */
declare function move(source: string, destination: string): Promise<void>;
/**
 * Returns file statistics for the given path. If the given path doesn't exist or is inaccessible,`NE_FS_NOPATHE` is thrown. Therefore, you can use this method to check for the existence of a file or directory.
 *
 * @param path - File or directory path.
 */
declare function getStats(path: string): Promise<Stats>;
/**
 * Returns the absolute path for a given path. This function works with paths that don't exist on the system.
 *
 * @param path - Path.
 */
declare function getAbsolutePath(path: string): Promise<string>;
/**
 * Returns the relative path for a given path and base. This function works with paths that don't exist on the system.
 *
 * @param path - Path.
 * @param base - Base path that is used for calculating the relative path with the path parameter. NL_CWD is used by default if this parameter is not provided.
 */
declare function getRelativePath(path: string, base?: string): Promise<string>;
/**
 * Parses a given path and returns its parts.
 *
 * @param path - Path.
 */
declare function getPathParts(path: string): Promise<PathParts>;
/**
 * Returns file permissions for a given path. Throws `NE_FS_NOPATHE` if the path doesn't exist or is inaccessible.
 *
 * @param path - Path.
 */
declare function getPermissions(path: string): Promise<Permissions$1>;
/**
 * Sets file permissions for a given path. Throws `NE_FS_UNLSTPR` if the framework can't update file permissions.
 *
 * @param path - Path.
 * @param permissions - File permissions using the Permissions object format.
 * @param mode - String(optional): Permission replacement mode. Accepted values are ADD, REPLACE(default), and REMOVE.
 */
declare function setPermissions(path: string, permissions: Permissions$1, mode: PermissionsMode): Promise<void>;
/**
 * Returns a single joined path from multiple input path segments.
 *
 * @param paths - A sequence of paths.
 */
declare function getJoinedPath(...paths: string[]): Promise<string>;
/**
 * Constructs a Unix-like path from a Windows path for cross-platform usage by replacing `\\` with `/`. This function only works on Windows and returns the same input string on non-Windows platforms.
 *
 * @param path - Windows-specific path.
 */
declare function getNormalizedPath(path: string): Promise<string>;
/**
 * Reverts a Unix-like path created with `filesystem.getNormalizedPath(path)` to a Windows-specific path by replacing `/` with `\\`. This function only works on Windows and returns the same input string on non-Windows platforms.
 *
 * @param path - Unix-like path.
 */
declare function getUnnormalizedPath(path: string): Promise<string>;
/**
 * Executes POSIX `access` operation to test existing file permissions. Throws `NE_FS_ACSFAIL` on failures.
 *
 * @param path - Directory or file path.
 * @param mode - POSIX file access mode. Accepted values are 0 (exist), 1 (execute), 2 (write), and 4 (read).
 */
declare function access(path: string, mode?: number): Promise<string>;
/**
 * Executes POSIX `chmod` operation for file access permission changes. Throws `NE_FS_CHMDERR` on failures.
 *
 * @param path - Directory or file path.
 * @param mode - POSIX file permission.
 */
declare function chmod(path: string, mode: number): Promise<string>;
/**
 * Executes POSIX `chown` operation to change file ownership. Throws `NE_FS_CHWNERR` on failures.
 *
 * @param path - Directory or file path.
 * @param uid - User identifier.
 * @param gid - Group identifier.
 */
declare function chown(path: string, uid: number, gid: number): Promise<string>;
export interface ExecCommandOptions {
	stdIn?: string;
	background?: boolean;
	cwd?: string;
}
export interface ExecCommandResult {
	pid: number;
	stdOut: string;
	stdErr: string;
	exitCode: number;
}
export interface SpawnedProcess {
	id: number;
	pid: number;
}
export interface SpawnedProcessOptions {
	cwd?: string;
	envs?: Record<string, string>;
}
export interface Envs {
	[key: string]: string;
}
export interface OpenDialogOptions {
	multiSelections?: boolean;
	filters?: Filter[];
	defaultPath?: string;
}
export interface FolderDialogOptions {
	defaultPath?: string;
}
export interface SaveDialogOptions {
	forceOverwrite?: boolean;
	filters?: Filter[];
	defaultPath?: string;
}
export interface Filter {
	name: string;
	extensions: string[];
}
export interface TrayOptions {
	icon: string;
	menuItems: TrayMenuItem[];
	useTemplateIcon?: boolean;
}
export interface TrayMenuItem {
	id?: string;
	text: string;
	isDisabled?: boolean;
	isChecked?: boolean;
}
export interface LocaleInfo {
	locale: string;
	language: string;
	region: string;
}
export type KnownPath = "config" | "data" | "cache" | "documents" | "pictures" | "music" | "video" | "downloads" | "savedGames1" | "savedGames2" | "temp";
/**
 * Executes a command and returns the output.
 *
 * @param command - The command that is to be executed.
 * @param options - Options.
 * @param options.background - Executes the command in background and resolves the Promise immediately if this is set to true. This option makes the process detached from the API function call, so if you need to connect with the newly created process later, consider using os.spawnProcess.
 * @param options.stdIn - Standard input as a string.
 * @param options.cwd - Current working directory.
 * @param options.envs - Key-value pairs of environment variables.
 */
declare function execCommand(command: string, options?: ExecCommandOptions): Promise<ExecCommandResult>;
/**
 * Spawns a process based on a command in background and lets developers control it.
 *
 * @param command - The command that is to be executed in a new process.
 * @param options - Options.
 * @param options.cwd - Current working directory.
 * @param options.envs - Key-value pairs of environment variables.
 */
declare function spawnProcess(command: string, options?: SpawnedProcessOptions): Promise<SpawnedProcess>;
/**
 * Updates a spawned process based on a provided action and data. Throws `NE_OS_UNLTOUP` if the process cannot be updated.
 *
 * @param id - Neutralino-scoped process identifier.
 * @param event - An action to take. Accepts only the following values:
 * @param data - Additional data for the action. Send standard input string if the action is stdIn.
 */
declare function updateSpawnedProcess(id: number, event: string, data?: any): Promise<void>;
/**
 * Returns all spawned processes.
 */
declare function getSpawnedProcesses(): Promise<SpawnedProcess[]>;
/**
 * Provides the value of a given environment variable.
 *
 * @param key - The name of the environment variable.
 */
declare function getEnv(key: string): Promise<string>;
/**
 * Creates or updates an environment key-value entity for the current process context. Throws `NE_OS_UNLTOUV` on failures.
 *
 * @param key - Environment variable key.
 * @param value - Environment variable value.
 */
declare function setEnv(key: string, value: string): Promise<string>;
/**
 * Returns all environment variables and their values.
 */
declare function getEnvs(): Promise<Envs>;
/**
 * Shows the file open dialog. You can use this function to obtain paths of existing files.
 *
 * @param title - Title of the dialog.
 * @param options - Options.
 * @param options.filters - An array of Filter objects to filter the files list.
 * @param options.multiSelections - Enables multi selections.
 * @param options.defaultPath - Initial path/filename displayed by the dialog.
 */
declare function showOpenDialog(title?: string, options?: OpenDialogOptions): Promise<string[]>;
/**
 * Shows the folder open dialog.
 *
 * @param title - Title of the dialog.
 * @param options - Options.
 * @param options.defaultPath - Initial path displayed by the dialog.
 */
declare function showFolderDialog(title?: string, options?: FolderDialogOptions): Promise<string>;
/**
 * Shows the file save dialog. You can use this function to obtain a path to create a new file.
 *
 * @param title - Title of the dialog.
 * @param options - Options.
 * @param options.filters - An array of Filter objects to filter the files list.
 * @param options.forceOverwrite - Skips file overwrite warning message.
 * @param options.defaultPath - Initial path/filename displayed by the dialog.
 */
declare function showSaveDialog(title?: string, options?: SaveDialogOptions): Promise<string>;
/**
 * Displays a notification message.
 *
 * @param title - Notification title.
 * @param content - Content of the notification.
 * @param icon - Icon name. Accepted values are: INFO, WARNING, ERROR, and QUESTION. The default value is INFO
 */
declare function showNotification(title: string, content: string, icon?: Icon): Promise<void>;
/**
 * Displays a message box.
 *
 * @param title - Title of the message box.
 * @param content - Content of the message box.
 * @param choice - Message box buttons. Accepted values are: OK, OK_CANCEL, YES_NO, YES_NO_CANCEL, RETRY_CANCEL, and ABORT_RETRY_IGNORE. The default value is OK.
 * @param icon - Icon name. Accepted values are: INFO, WARNING, ERROR, and QUESTION. The default value is INFO.
 */
declare function showMessageBox(title: string, content: string, choice?: MessageBoxChoice, icon?: Icon): Promise<string>;
/**
 * Creates/updates the tray icon and menu.
 *
 * @param options - Options.
 * @param options.icon - Tray icon path. Eg: /resources/icons/trayIcon.png. A 20x20-sized PNG image file works fine on all supported operating systems.
 * @param options.menuItems - An array of TrayMenuItem objects.
 * @param options.useTemplateIcon - If this is set to true, activates adaptive tray icon (also known as template icons) with color-scheme updates on macOS.
 */
declare function setTray(options: TrayOptions): Promise<void>;
/**
 * Opens a URL with the default web browser.
 *
 * @param url - URL to be opened.
 */
declare function open$1(url: string): Promise<void>;
/**
 * Returns known platform-specific folders such as Downloads, Music, Videos, etc.
 *
 * @param name - Name of the folder. Accepted values are: config, data, cache, home, desktop, documents, pictures, music, video, downloads, saveGames1, saveGames2, and temp. Throws NE_OS_INVKNPT for invalid folder names.
 */
declare function getPath(name: KnownPath): Promise<string>;
/**
 * Sends a file or directory into the system trash container. Throws `NE_OS_UNLTRAS` on failures.
 *
 * @param path - Directory or file path.
 */
declare function trashItem(path: string): Promise<string>;
/**
 * Retrieves the current system locale information.
 */
declare function getLocaleInfo(): Promise<LocaleInfo>;
export interface MemoryInfo {
	physical: {
		total: number;
		available: number;
	};
	virtual: {
		total: number;
		available: number;
	};
}
export interface KernelInfo {
	variant: string;
	version: string;
}
export interface OSInfo {
	name: string;
	description: string;
	version: string;
}
export interface CPUInfo {
	vendor: string;
	model: string;
	frequency: number;
	architecture: string;
	logicalThreads: number;
	physicalCores: number;
	physicalUnits: number;
}
export interface Display {
	id: number;
	resolution: Resolution;
	dpi: number;
	bpp: number;
	refreshRate: number;
}
export interface Disk {
	id: number;
	vendor: string;
	model: string;
	serial: string;
	total: number;
	free: number;
}
export interface Resolution {
	width: number;
	height: number;
}
export interface MousePosition {
	x: number;
	y: number;
}
export interface NetworkInterfaceAddress {
	address: string;
	mac: string;
	isInternal: boolean;
	family: NetworkFamily;
}
export interface NetworkInterfaceInfo {
	[key: string]: NetworkInterfaceAddress;
}
/**
 * Returns system memory statistics in bytes.
 */
declare function getMemoryInfo(): Promise<MemoryInfo>;
/**
 * Returns the CPU architecture identifier: `x64` (x86 64bit/arm64), `ia32` (x86 32bit), `arm`, `itanium`, or `unknown`.
 */
declare function getArch(): Promise<string>;
/**
 * Returns operating system kernel information.
 */
declare function getKernelInfo(): Promise<KernelInfo>;
/**
 * Returns operating system information.
 */
declare function getOSInfo(): Promise<OSInfo>;
/**
 * Returns the CPU information.
 */
declare function getCPUInfo(): Promise<CPUInfo>;
/**
 * Returns information about all connected displays.
 */
declare function getDisplays(): Promise<Display[]>;
/**
 * Returns information about all connected disks.
 */
declare function getDisks(): Promise<Disk>;
/**
 * Returns the hostname.
 */
declare function getHostname(): Promise<string>;
/**
 * Returns the current mouse cursor position.
 */
declare function getMousePosition(): Promise<MousePosition>;
/**
 * Updates the current mouse cursor position. Throws `NE_CO_UNLTOSC` if cursor position update is not implemented (e.g., on Wayland) or fails.
 *
 * @param x - Distance from the left edge of the screen in pixels.
 * @param y - Distance from the top edge of the screen in pixels.
 */
declare function setMousePosition(x: number, y: number): Promise<void>;
/**
 * Activates or deactivates confining mouse cursor within the app window region. Throws `NE_CO_UNLTOMG` if mouse grabbing is not implemented (e.g., on Wayland) or fails.
 *
 * @param grabbing - Mouse grabbing state. Activates if true and deactivates if false.
 */
declare function setMouseGrabbing(grabbing: boolean): Promise<void>;
/**
 * Simulates a key press, down, or up event. Throws `NE_CO_UNLTOSK` if keyboard simulation is not implemented (e.g., on Wayland) or fails.
 *
 * @param key - Platform-specific key code. e.g., 38 refers to the letter 'a' on Linux (X11)
 * @param state - Keyboard button state. Accepted values: press, down, and up. The default value is press.
 */
declare function sendKey(key: number, state: SendKeyState): Promise<void>;
/**
 * Returns network interfaces information.
 */
declare function getNetworkInterfaces(): Promise<NetworkInterfaceInfo>;
/**
 * Returns the platform-specific computer identifier.
 */
declare function getMachineId(): Promise<string>;
/**
 * Writes data into Neutralinojs shared storage.
 *
 * @param key - A unique identifier.
 * @param data - Data as a string. If this value is null or undefined, the specific data record will be erased from the disk.
 */
declare function setData(key: string, data: string | null): Promise<void>;
/**
 * Reads and returns data for a given Neutralinojs shared storage key.
 *
 * @param key - Storage data record identifier.
 */
declare function getData(key: string): Promise<string>;
/**
 * Removes a saved storage record.
 *
 * @param key - Storage data record identifier.
 */
declare function removeData(key: string): Promise<void>;
/**
 * Returns all storage keys.
 */
declare function getKeys(): Promise<string[]>;
/**
 * Clears the whole storage by removing the `.storage` directory.
 */
declare function clear(): Promise<void>;
/**
 * Writes messages to `neutralinojs.log` file or/and standard output streams.
 *
 * @param message - Content to be logged.
 * @param type - Type of the message. Accepted values are INFO, WARNING, and ERROR. The default value is INFO.
 */
declare function log(message: string, type?: LoggerType): Promise<void>;
export interface OpenActionOptions {
	url: string;
}
export interface RestartOptions {
	args: string;
}
/**
 * Terminates the running application.
 *
 * @param code - Process's exit code. The default value is always 0 (success).
 */
declare function exit(code?: number): Promise<void>;
/**
 * Kills the application process. If the application becomes unresponsive, you can use this to terminate the process instantly. It is recommended to use the `exit()` method to close your application properly.
 */
declare function killProcess(): Promise<void>;
/**
 * Restarts the current application instance.
 *
 * @param options - Options.
 * @param options.args - Additional command-line arguments that need to be passed to the new application instance's process.
 */
declare function restartProcess(options?: RestartOptions): Promise<void>;
/**
 * Returns the current application configuration as a JSON object.
 */
declare function getConfig(): Promise<any>;
/**
 * Dispatches a new event to all app instances.
 *
 * @param event - Name of the event.
 * @param data - Additional data for the event.
 */
declare function broadcast(event: string, data?: any): Promise<void>;
/**
 * Reads string data from the standard input stream of the application process.
 *
 * @param readAll - If this is set to true, the framework will read the entire standard stream. Otherwise, only one line will be returned. The default value for this option is false.
 */
declare function readProcessInput(readAll?: boolean): Promise<string>;
/**
 * Writes string data to the standard output stream of the application process.
 *
 * @param data - Data to be written.
 */
declare function writeProcessOutput(data: string): Promise<void>;
/**
 * Writes string data to the standard error stream of the application process.
 *
 * @param data - Data to be written.
 */
declare function writeProcessError(data: string): Promise<void>;
/**
 * Returns the process identifier (PID)
 */
declare function getProcessId(): Promise<number>;
export interface WindowOptions extends WindowSizeOptions, WindowPosOptions {
	title?: string;
	icon?: string;
	fullScreen?: boolean;
	alwaysOnTop?: boolean;
	enableInspector?: boolean;
	borderless?: boolean;
	maximize?: boolean;
	hidden?: boolean;
	maximizable?: boolean;
	useSavedState?: boolean;
	exitProcessOnClose?: boolean;
	extendUserAgentWith?: string;
	injectGlobals?: boolean;
	injectClientLibrary?: boolean;
	injectScript?: string;
	processArgs?: string;
}
export interface WindowSizeOptions {
	width?: number;
	height?: number;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
	resizable?: boolean;
}
export interface WindowPosOptions {
	x?: number;
	y?: number;
	center?: boolean;
}
export interface WindowMenu extends Array<WindowMenuItem> {
}
export interface WindowMenuItem {
	id?: string;
	text: string;
	action?: string;
	shortcut?: string;
	isDisabled?: boolean;
	isChecked?: boolean;
	menuItems?: WindowMenuItem[];
}
/**
 * Sets the title of the native window.
 *
 * @param title - Title of the window. Clears the title, if the function was called without the parameter.
 */
declare function setTitle(title: string): Promise<void>;
/**
 * Returns the title of the native window.
 */
declare function getTitle(): Promise<string>;
/**
 * Maximizes the native window.
 */
declare function maximize(): Promise<void>;
/**
 * Restores the native window.
 */
declare function unmaximize(): Promise<void>;
/**
 * Returns `true` if the native window is maximized.
 */
declare function isMaximized(): Promise<boolean>;
/**
 * Minimizes the native window.
 */
declare function minimize(): Promise<void>;
/**
 * Restores the native window from the minimized state.
 */
declare function unminimize(): Promise<void>;
/**
 * Returns `true` if the native window is minimized.
 */
declare function isMinimized(): Promise<boolean>;
/**
 * Enables the full screen mode.
 */
declare function setFullScreen(): Promise<void>;
/**
 * Exits from the full screen mode.
 */
declare function exitFullScreen(): Promise<void>;
/**
 * Returns `true` if the native window is in the full screen mode.
 */
declare function isFullScreen(): Promise<boolean>;
/**
 * Shows the native window.
 */
declare function show(): Promise<void>;
/**
 * Hides the native window.
 */
declare function hide(): Promise<void>;
/**
 * Returns `true` if the native window is visible.
 */
declare function isVisible(): Promise<boolean>;
/**
 * Focuses the native window.
 */
declare function focus$1(): Promise<void>;
/**
 * Sets an icon for the native window or Dock.
 *
 * @param icon - Path of the icon. A 200x200 PNG image file works fine on all supported operating systems.
 */
declare function setIcon(icon: string): Promise<void>;
/**
 * Moves the native window into given coordinates. Neutralinojs's cross-platform coordinate system starts from top-left corner of the screen. In other words, `x=0,y=0` point refers to the top-left corner of the device's main screen.
 *
 * @param x - An integer value for the horizontal position.
 * @param y - An integer value for the vertical position.
 */
declare function move$1(x: number, y: number): Promise<void>;
/**
 * Centers the native app window within the current display.
 */
declare function center(): Promise<void>;
/**
 * Starts dragging the native window if the left mouse button is pressed. The draggable region API in the Neutralinojs client library uses this function internally to move the window with the pointer events web API.
 */
declare function beginDrag(screenX?: number, screenY?: number): Promise<void>;
/**
 * Converts a given DOM element to a draggable region. The user will be able to drag the native window by dragging the given DOM element. This feature is suitable to make custom window bars along with the [borderless mode](../configuration/neutralino.config.json#modeswindowborderless-boolean).
 *
 * @param DOMElementOrId - String | HTMLElement: A DOM element identifier.
 * @param options - Customize the behavior of the draggable region.
 */
declare function setDraggableRegion(DOMElementOrId: string | HTMLElement, options?: {
	exclude?: Array<string | HTMLElement>;
}): Promise<{
	success: true;
	message: string;
	exclusions: {
		add(elements: Array<string | HTMLElement>): void;
		remove(elements: Array<string | HTMLElement>): void;
		removeAll(): void;
	};
}>;
/**
 * Converts a draggable region to a normal DOM elements by removing drag event handlers.
 *
 * @param DOMElementOrId - String | HTMLElement: A DOM element identifier.
 */
declare function unsetDraggableRegion(DOMElementOrId: string | HTMLElement): Promise<{
	success: true;
	message: string;
}>;
/**
 * This method sets the size of the window.
 *
 * @param options - Options.
 * @param options.width - Window width in pixels.
 * @param options.height - Window height in pixels.
 * @param options.minWidth - Minimum width of the window in pixels.
 * @param options.minHeight - Minimum height of the window in pixels.
 * @param options.maxWidth - Maximum width of the window in pixels.
 * @param options.maxHeight - Maximum height of the window in pixels.
 * @param options.resizable - A boolean value to make the window resizable or fixed.
 */
declare function setSize(options: WindowSizeOptions): Promise<void>;
/**
 * Returns window size information.
 */
declare function getSize(): Promise<WindowSizeOptions>;
/**
 * Returns window position coordinates.
 */
declare function getPosition(): Promise<WindowPosOptions>;
/**
 * Activates or deactivates the always on top mode.
 *
 * @param onTop - Says whether the on top mode should be activated or not. The default value is true.
 */
declare function setAlwaysOnTop(onTop: boolean): Promise<void>;
/**
 * Activates or deactivates the borderless mode.
 *
 * @param borderless - Says whether the borderless mode should be activated or not. The default value is true.
 */
declare function setBorderless(borderless: boolean): Promise<void>;
/**
 * Creates a native window. You can use this method to create new window for your multi-window Neutralinojs app. Neutralinojs spawns a new process for each native window. Therefore, the new window works as an isolated app once the window is created.
 *
 * @param url - URL to be loaded. Eg: /resources/aboutWindow.html. Supports loading both local and remote app resources. Local resource paths need to begin with /.
 * @param options - (optional): an instance of WindowOptions type.
 */
declare function create(url: string, options?: WindowOptions): Promise<void>;
/**
 * Takes a snapshop of the current window client area (without the window frame) and stores as a PNG image file.
 *
 * @param path - Path where the snapshot PNG file should be stored.
 */
declare function snapshot(path: string): Promise<void>;
/**
 * Creates/updates the main window menu on GNU/Linux and Windows and application menu on macOS.
 *
 * @param options - An array of WindowMenuItem objects.
 */
declare function setMainMenu(options: WindowMenu): Promise<void>;
/**
 * Displays the native print dialog for the current page. Developers can use this function instead of the built-in web `window.print()` function as a cross-platform solution since macOS webview doesn't pre-implement `window.print()`.
 */
declare function print$1(): Promise<void>;
interface Response$1 {
	success: boolean;
	message: string;
}
export type Builtin = "ready" | "trayMenuItemClicked" | "windowClose" | "serverOffline" | "clientConnect" | "clientDisconnect" | "appClientConnect" | "appClientDisconnect" | "extClientConnect" | "extClientDisconnect" | "extensionReady" | "neuDev_reloadApp";
declare function on(event: string, handler: (ev: CustomEvent) => void): Promise<Response$1>;
declare function off(event: string, handler: (ev: CustomEvent) => void): Promise<Response$1>;
declare function dispatch(event: string, data?: any): Promise<Response$1>;
/**
 * Dispatches a new event to all clients (both app and extension clients).
 *
 * @param event - Name of the event.
 * @param data - Additional data for the event.
 */
declare function broadcast$1(event: string, data?: any): Promise<void>;
export interface ExtensionStats {
	loaded: string[];
	connected: string[];
}
/**
 * Dispatches a new event to an extension instance. If the targeted extension is not connected yet, Neutralino client library will queue the function call and send whenever the extension comes online.
 *
 * @param extensionId - Extension identifier.
 * @param event - Name of the event.
 * @param data - Additional data for the event.
 */
declare function dispatch$1(extensionId: string, event: string, data?: any): Promise<void>;
/**
 * Dispatches a new event to all connected extensions. If an extension is loaded but not connected yet, the particular extension won't get the new event. Use [`extensions.dispatch`](#extensionsdispatchextensionid-eventname-data) to send messages even if the extension is not connected to the main process.
 *
 * @param event - Name of the event.
 * @param data - Additional data for the event.
 */
declare function broadcast$2(event: string, data?: any): Promise<void>;
/**
 * Returns details about connected and loaded extensions.
 */
declare function getStats$1(): Promise<ExtensionStats>;
export interface Manifest {
	applicationId: string;
	version: string;
	resourcesURL: string;
}
/**
 * Checks latest updates from the given URL. The URL should return a valid Neutralinojs update manifest with `Content-Type: application/json` header. Throws `NE_UP_CUPDMER` for invalid manifests and `NE_UP_CUPDERR` for network connectivity issues.
 *
 * @param url - URL to fetch update manifest.
 */
declare function checkForUpdates(url: string): Promise<Manifest>;
/**
 * Installs updates from the downloaded update manifest. Throws `NE_UP_UPDNOUF` if the manifest isn't loaded. If the update installation process fails, this function will throw `NE_UP_UPDINER`.
 */
declare function install(): Promise<void>;
export interface ClipboardImage {
	width: number;
	height: number;
	bpp: number;
	bpr: number;
	redMask: number;
	greenMask: number;
	blueMask: number;
	redShift: number;
	greenShift: number;
	blueShift: number;
	data: ArrayBuffer;
}
/**
 * Returns the current data format of the system clipboard.
 */
declare function getFormat(): Promise<ClipboardFormat>;
/**
 * Reads and returns text from system clipboard.
 */
declare function readText(): Promise<string>;
/**
 * Reads and returns an image from system clipboard.
 *
 * @param format - Pixel data format. Accepted values are rgb, rgba, argb, and bgra. By default, the function uses the default platform-specific pixel data format.
 */
declare function readImage(format?: string): Promise<ClipboardImage | null>;
/**
 * Writes text into the system clipboard.
 *
 * @param data - Text to store into the system clipboard.
 */
declare function writeText(data: string): Promise<void>;
/**
 * Writes image into the system clipboard.
 */
declare function writeImage(image: ClipboardImage): Promise<void>;
/**
 * Reads and returns HTML from system clipboard.
 */
declare function readHTML(): Promise<string>;
/**
 * Writes HTML into the system clipboard.
 *
 * @param data - HTML to store into the system clipboard.
 */
declare function writeHTML(data: string): Promise<void>;
declare function clear$1(): Promise<void>;
interface Stats$1 {
	size: number;
	isFile: boolean;
	isDirectory: boolean;
}
/**
 * Returns all files and directories embedded in the resource bundle.
 */
declare function getFiles(): Promise<string[]>;
/**
 * Returns resource file statistics for the given path. If the given path doesn't exist or is inaccessible,`NE_RS_NOPATHE` is thrown. So, you can use this method to check for the existance of a file or directory.
 *
 * @param path - Resource path.
 */
declare function getStats$2(path: string): Promise<Stats$1>;
/**
 * Extracts a file from the resources bundle to a preferred path. Throws `NE_RS_FILEXTF` for file extraction failures.
 *
 * @param path - Resource file path, i.e., /resources/icons/appIcon.png, starts with / similar to all Neutralinojs app resources.
 * @param destination - Path where the extract file should be created.
 */
declare function extractFile(path: string, destination: string): Promise<void>;
/**
 * Extracts a directory from the resources bundle to a preferred path. Throws `NE_RS_DIREXTF` for directory extraction failures.
 *
 * @param path - Resource directory path, i.e., /resources/icons, starts with / similar to all Neutralinojs app resources.
 * @param destination - Path where all extracted files should be stored.
 */
declare function extractDirectory(path: string, destination: string): Promise<void>;
/**
 * Reads a text file from resources.
 *
 * @param path - Resource path.
 */
declare function readFile$1(path: string): Promise<string>;
/**
 * Reads a binary file from resources.
 *
 * @param path - Resource path.
 */
declare function readBinaryFile$1(path: string): Promise<ArrayBuffer>;
/**
 * Mounts a local directory. Throws `NE_FS_NOPATHE` and `NE_FS_NOTADIR` for invalid targets and `NE_SR_MPINUSE` if the path is already mounted.
 *
 * @param path - Resource path.
 * @param target - A directory in the local filesystem.
 */
declare function mount(path: string, target: string): Promise<void>;
/**
 * Deactivates a mount configuration. Throws `NE_SR_NOMTPTH` if the provided path is not mounted.
 *
 * @param path - Resource path.
 */
declare function unmount(path: string): Promise<void>;
/**
 * Lists mount configurations.
 */
declare function getMounts(): Promise<Record<string, string>>;
export interface NetHeaders {
	[key: string]: string;
}
export interface NetParams {
	[key: string]: string;
}
export interface NetRequestOptions {
	timeout?: boolean;
	params?: NetParams[];
	headers?: NetHeaders[];
	auth?: {
		username: string;
		password: string;
	};
	encodePath: boolean;
	keepAlive: boolean;
}
export interface NetResponse {
	status: number;
	statusText: string;
	body: string;
	headers: NetHeaders[];
	cookies: string;
	location: string;
	version: string;
}
declare function request(url: string, method?: string, options?: NetRequestOptions): Promise<NetResponse>;
declare function get(url: string, options?: NetRequestOptions): Promise<NetResponse>;
declare function post(url: string, options?: NetRequestOptions): Promise<NetResponse>;
declare function head(url: string, options?: NetRequestOptions): Promise<NetResponse>;
declare function put(url: string, options?: NetRequestOptions): Promise<NetResponse>;
declare function __delete(url: string, options?: NetRequestOptions): Promise<NetResponse>;
declare function patch(url: string, options?: NetRequestOptions): Promise<NetResponse>;
declare function options(url: string, options?: NetRequestOptions): Promise<NetResponse>;
export declare const net: {
	request: typeof request;
	get: typeof get;
	post: typeof post;
	head: typeof head;
	put: typeof put;
	patch: typeof patch;
	options: typeof options;
	delete: typeof __delete;
};
/**
 * Returns all custom methods added by the app developer.
 */
declare function getMethods(): Promise<string[]>;
export interface InitOptions {
	exportCustomMethods?: boolean;
}
export declare function init(options?: InitOptions): void;
export type ErrorCode = "NE_FS_DIRCRER" | "NE_FS_RMDIRER" | "NE_FS_FILRDER" | "NE_FS_FILWRER" | "NE_FS_FILRMER" | "NE_FS_NOPATHE" | "NE_FS_COPYFER" | "NE_FS_MOVEFER" | "NE_OS_INVMSGA" | "NE_OS_INVKNPT" | "NE_ST_INVSTKY" | "NE_ST_STKEYWE" | "NE_RT_INVTOKN" | "NE_RT_NATPRME" | "NE_RT_APIPRME" | "NE_RT_NATRTER" | "NE_RT_NATNTIM" | "NE_CL_NSEROFF" | "NE_EX_EXTNOTC" | "NE_UP_CUPDMER" | "NE_UP_CUPDERR" | "NE_UP_UPDNOUF" | "NE_UP_UPDINER";
interface Error$1 {
	code: ErrorCode;
	message: string;
}
declare global {
	/** Mode of the application: window, browser, cloud, or chrome */
	const NL_MODE: Mode;
	/** Application port */
	const NL_PORT: number;
	/** Command-line arguments */
	const NL_ARGS: string[];
	/** Basic authentication token */
	const NL_TOKEN: string;
	/** Neutralinojs client version */
	const NL_CVERSION: string;
	/** Application identifier */
	const NL_APPID: string;
	/** Application version */
	const NL_APPVERSION: string;
	/** Application path */
	const NL_PATH: string;
	/** Application data path */
	const NL_DATAPATH: string;
	/** Returns true if extensions are enabled */
	const NL_EXTENABLED: boolean;
	/** Returns true if the client library is injected */
	const NL_GINJECTED: boolean;
	/** Returns true if globals are injected */
	const NL_CINJECTED: boolean;
	/** Operating system name: Linux, Windows, Darwin, FreeBSD, or Uknown */
	const NL_OS: OperatingSystem;
	/** CPU architecture: x64, arm, itanium, ia32, or unknown */
	const NL_ARCH: Architecture;
	/** Neutralinojs server version */
	const NL_VERSION: string;
	/** Current working directory */
	const NL_CWD: string;
	/** Identifier of the current process */
	const NL_PID: string;
	/** Source of application resources: bundle or directory */
	const NL_RESMODE: string;
	/** Release commit of the client library */
	const NL_CCOMMIT: string;
	/** An array of custom methods */
	const NL_CMETHODS: string[];
}

declare namespace custom {
	export { getMethods };
}
declare namespace filesystem {
	export { access, appendBinaryFile, appendFile, chmod, chown, copy, createDirectory, createWatcher, getAbsolutePath, getJoinedPath, getNormalizedPath, getOpenedFileInfo, getPathParts, getPermissions, getRelativePath, getStats, getUnnormalizedPath, getWatchers, move, openFile, readBinaryFile, readDirectory, readFile, remove, removeWatcher, setPermissions, updateOpenedFile, writeBinaryFile, writeFile };
}
declare namespace os {
	export { execCommand, getEnv, getEnvs, getLocaleInfo, getPath, getSpawnedProcesses, open$1 as open, setEnv, setTray, showFolderDialog, showMessageBox, showNotification, showOpenDialog, showSaveDialog, spawnProcess, trashItem, updateSpawnedProcess };
}
declare namespace computer {
	export { getArch, getCPUInfo, getDisks, getDisplays, getHostname, getKernelInfo, getMachineId, getMemoryInfo, getMousePosition, getNetworkInterfaces, getOSInfo, sendKey, setMouseGrabbing, setMousePosition };
}
declare namespace storage {
	export { clear, getData, getKeys, removeData, setData };
}
declare namespace debug {
	export { log };
}
declare namespace app {
	export { broadcast, exit, getConfig, getProcessId, killProcess, readProcessInput, restartProcess, writeProcessError, writeProcessOutput };
}
declare namespace window$1 {
	export { beginDrag, center, create, exitFullScreen, focus$1 as focus, getPosition, getSize, getTitle, hide, isFullScreen, isMaximized, isMinimized, isVisible, maximize, minimize, move$1 as move, print$1 as print, setAlwaysOnTop, setBorderless, setDraggableRegion, setFullScreen, setIcon, setMainMenu, setSize, setTitle, show, snapshot, unmaximize, unminimize, unsetDraggableRegion };
}
declare namespace events {
	export { broadcast$1 as broadcast, dispatch, off, on };
}
declare namespace extensions {
	export { broadcast$2 as broadcast, dispatch$1 as dispatch, getStats$1 as getStats };
}
declare namespace updater {
	export { checkForUpdates, install };
}
declare namespace clipboard {
	export { clear$1 as clear, getFormat, readHTML, readImage, readText, writeHTML, writeImage, writeText };
}
declare namespace resources {
	export { extractDirectory, extractFile, getFiles, getStats$2 as getStats, readBinaryFile$1 as readBinaryFile, readFile$1 as readFile };
}
declare namespace server {
	export { getMounts, mount, unmount };
}

export {
	Error$1 as Error,
	Permissions$1 as Permissions,
	Response$1 as Response,
	app,
	clipboard,
	computer,
	custom,
	debug,
	events,
	extensions,
	filesystem,
	os,
	resources,
	server,
	storage,
	updater,
	window$1 as window,
};

export as namespace Neutralino;

export {};
