import { Config } from "./Config";
import { connect } from "./aladarClient";
import { IMenuButton } from "./types/IMenuButton";

export const startMenu = (config:Config) => {
	const changeValue = (buttonId:number, valueName:"showPlayer" | "autoConnect") => (() => {

		const button = buttonList[buttonId];
		const status = button.status == "on" ? false : true;
	
		button.status = status ? "on" : "off";
		config[valueName] = status;
	
		reloadMenu();
	});

	const buttonList:IMenuButton[] = [
		{
			name: "Connect to new server",
			callback: () => {
				const data = prompt("URL::JOINCODE", "");
				if (!data) return alert("Empty data provided.");
				connect(config, data);
			}
		},
		{
			name: "Connect to last server",
			callback: () => {
				const lastServer = config.lastServer;
				if (!lastServer) return alert("There is no last server.");
				connect(config, lastServer);
			}
		},
		{
			name: "Auto-connect to last server: ",
			status: config.autoConnect ? "on" : "off",
			callback: changeValue(2, "autoConnect")
		},
		{
			name: "Show you on minimap: ",
			status: config.showPlayer ? "on" : "off",
			callback: changeValue(3, "showPlayer")
		},
		{
			name: "Guide/Гайд",
			callback: () => { window.open("https://github.com/ClintFlames/aladar/blob/main/Guide.md", "_blank")?.focus(); }
		}
	];

	const loadMenu = () => {
		for (const button of buttonList) {
			if (!button.status) { GM.registerMenuCommand(button.name, button.callback); continue; }
			button.currentName = button.name + button.status;
			GM.registerMenuCommand(button.currentName, button.callback);
		}
	}
	
	const reloadMenu = () => {
		for (const button of buttonList) {
			if (!button.currentName) { GM.unregisterMenuCommand(button.name); continue; }
			GM.unregisterMenuCommand(button.currentName);
			button.currentName = "";
		}
		loadMenu();
	}
	
	loadMenu();

	GM.notification({
		title: "Aladar",
		text: "Loading complete"
	});
}