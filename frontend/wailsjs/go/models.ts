export namespace frontend {
	
	export class FileFilter {
	    DisplayName: string;
	    Pattern: string;
	
	    static createFrom(source: any = {}) {
	        return new FileFilter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.DisplayName = source["DisplayName"];
	        this.Pattern = source["Pattern"];
	    }
	}

}

export namespace main {
	
	export class AppConfig {
	    Localize: boolean;
	    RunTests: boolean;
	    AppDir: string;
	
	    static createFrom(source: any = {}) {
	        return new AppConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Localize = source["Localize"];
	        this.RunTests = source["RunTests"];
	        this.AppDir = source["AppDir"];
	    }
	}
	export class DirectoryEntry {
	    path: string;
	    isDir: boolean;
	
	    static createFrom(source: any = {}) {
	        return new DirectoryEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.isDir = source["isDir"];
	    }
	}
	export class FileStats {
	    isFile: boolean;
	    isDir: boolean;
	    size: number;
	
	    static createFrom(source: any = {}) {
	        return new FileStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isFile = source["isFile"];
	        this.isDir = source["isDir"];
	        this.size = source["size"];
	    }
	}

}

