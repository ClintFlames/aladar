interface UnsafeWindow extends Omit<Window, "unsafeWindow"> {
	diepAPI: typeof import("diepapi/dist/src")
}

export interface IWindow extends Window { unsafeWindow: UnsafeWindow }