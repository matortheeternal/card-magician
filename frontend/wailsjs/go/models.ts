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

}

