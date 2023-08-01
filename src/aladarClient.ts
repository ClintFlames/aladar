import { Config } from "./Config";
import { IPlayer } from "./types/IPlayer";
import { IWindow } from "./types/IWindow";

declare const window:IWindow;

let _config:Config;
let _playerList:IPlayer[] = [];

const { player: _player, game, minimap, arena } = window.unsafeWindow.diepAPI.apis;
const { Vector } = window.unsafeWindow.diepAPI.core;
let isOnline = false;


const clamp = (x:number, min:number, max:number) => Math.min(Math.max(x, min), max);
const scaleNumber = (x:number, origin:number[], target:number[]) =>
	(x - origin[0]) * (target[1] - target[0]) / (origin[1] - origin[0]) + target[0];



export const connect = (config:Config, data:string) => {
	if (isOnline) return alert("Already online");
	isOnline = true;

	const [url, joinCode] = data.split("::");

	if (!url) return alert("URL can't be empty.")
	if (!joinCode) return alert("You must specify joinCode.");

	const ws = (() => { try {
		return new WebSocket(url);
	} catch (e) {
		if (e instanceof Error) {
			if (e.message.endsWith("is invalid.")) return alert("URL is invalid.");
			console.log("ERROR: BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB\n");
			console.log(e.message);
			isOnline = false;
		}
	} })();

	if (!(ws instanceof WebSocket)) return;

	ws.binaryType = "arraybuffer";
	config.lastServer = data;
	
	const playerList:IPlayer[] = [];
	
	_playerList = playerList;
	_config = config;

	ws.onerror = e => {
		console.log("ERROR: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n");
		console.log(e);
		isOnline = false;
	}

	ws.onclose = e => {
		isOnline = false;
		switch (e.code) {
			case 4001: alert("joinCode is wrong."); break;
			case 4002: alert("Server player limit is reached."); break;
			case 4003: connect(config, data); break;
		}
	}

	ws.onopen = () => {
		console.log("OPENED");
		ws.send(joinCode);
	}

	ws.onmessage = m => {
		const data = new Uint8Array(m.data);
		switch (data[0]) {
			case 0: {
				for (let i = 1; i < data.length; i += 4) {
					playerList.push({
						id: data[i],
						color: data.slice(i + 1, i + 4).reduce((o, v) => o + v.toString(16).padStart(2, "0"), "#"),
						pos: { x: NaN, y: NaN }
					});
				}
				break;
			}
			case 1: {
				if (_player.isDead) return ws.send("");
				const pos = [
					Math.floor(clamp(scaleNumber(
						_player.position.x,
						[arena.size * -0.5, arena.size * 0.5],
						[0, 255]
					), 0, 255)),
					Math.floor(clamp(scaleNumber(
						_player.position.y,
						[arena.size * -0.5, arena.size * 0.5],
						[0, 255]
					), 0, 255))
				];
				if (pos[0] > 255 || pos[1] > 255) return ws.send("");
				ws.send(new Uint8Array(pos));
				break;
			}
			case 2: {
				const closeListLength = data[1];
				if (closeListLength) {
					for (let i = 0; i < closeListLength; i++) {
						const id = data[2 + i];
						playerList.splice(playerList.findIndex(p => p.id == id), 1);
					}
				}
				for (const player of playerList) player.pos = { x: NaN, y: NaN }
				for (let i = 2 + closeListLength; i < data.length; i += 3) {
					const player = playerList.find(p => p.id == data[i]);
					if (!player) continue;
					player.pos = {
						x: data[i + 1],
						y: data[i + 2]
					}
				}
				break;
			}
		}
	}
}

game.once("ready", () => {
	let ctx:CanvasRenderingContext2D;

	const interval = setInterval(() => {
		if (!_config) return;
		const canvas = <HTMLCanvasElement> document.getElementById("canvas");
		if (!canvas) return;
		const _ctx = canvas.getContext("2d");
		if (!_ctx) return;

		ctx = _ctx;
		clearInterval(interval);
		game.on("frame", () => {
			ctx.globalAlpha = 1;
			for (const { color, pos } of _playerList) {
				if (!_config.showPlayer && color == _playerList[0].color) continue;
				if (isNaN(pos.x)) continue;
				const { x, y } = Vector.add(minimap.minimapPos, Vector.multiply(minimap.minimapDim, {
					x: scaleNumber(pos.x, [0, 255], [0, 1]),
					y: scaleNumber(pos.y, [0, 255], [0, 1])
				}));
				
				ctx.fillStyle = color;
				ctx.beginPath();
				ctx.arc(x, y, 3 * window.unsafeWindow.devicePixelRatio, 0, 2 * Math.PI);
				ctx.fill();

				ctx.strokeStyle = "#333339";
				ctx.stroke();
			}
		});
	}, 100);
});