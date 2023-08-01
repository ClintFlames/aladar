import { Config } from "./Config";
import { connect } from "./aladarClient";
import { startMenu } from "./menu";
import { IWindow } from "./types/IWindow";

declare const VM: { shortcut:import("@violentmonkey/shortcut").KeyboardService }
declare const window: IWindow;

const _window = window.unsafeWindow;
const config = new Config();

config.init(() => {
	if (config.autoConnect && config.lastServer) connect(config, config.lastServer);
	startMenu(config);
});

// const { Vector, CanvasKit } = _window.diepAPI.core;
// const { player, game, minimap, arena } = _window.diepAPI.apis;
// const { backgroundOverlay } = _window.diepAPI.tools;