const getValue = async <T>(name:string, defaultValue:T):Promise<T> => {
	const v:T = await GM.getValue(name);
	if (typeof v != typeof defaultValue) return defaultValue;
	return v;
}

export class Config {
	#lastServer :string  = "";
	#showPlayer :boolean = true;
	#autoConnect:boolean = true;

	public get lastServer ():string   { return this.#lastServer; }
	public set lastServer (v:string)  { GM.setValue("lastServer", v); this.#lastServer = v; }
	
	public get showPlayer ():boolean  { return this.#showPlayer; }
	public set showPlayer (v:boolean) { GM.setValue("showPlayer", v); this.#showPlayer = v; }

	public get autoConnect():boolean  { return this.#autoConnect; }
	public set autoConnect(v:boolean) { GM.setValue("autoConnect", v); this.#autoConnect = v; }

	constructor() {}
	
	async init(callback:(config:Config) => any) {
		this.lastServer  = await getValue("lastServer" , "");
		this.showPlayer  = await getValue("showPlayer" , true);
		this.autoConnect = await getValue("autoConnect", true);

		GM.addValueChangeListener("lastServer" , (_, oldValue, newValue) => {
			if (typeof newValue == "string") return;
			if (typeof oldValue == "string") return this.lastServer = oldValue;
			this.lastServer = "";
		});
		GM.addValueChangeListener("showPlayer" , (_, oldValue, newValue) => {
			if (typeof newValue == "boolean") return;
			if (typeof oldValue == "boolean") return this.showPlayer = oldValue;
			this.showPlayer = true;
		});
		GM.addValueChangeListener("autoConnect", (_, oldValue, newValue) => {
			if (typeof newValue == "boolean") return;
			if (typeof oldValue == "boolean") return this.autoConnect = oldValue;
			this.autoConnect = true;
		});

		callback(this);
	}
}