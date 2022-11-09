const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		entry: {"file":"_app/immutable/start-919036b4.js","imports":["_app/immutable/start-919036b4.js","_app/immutable/chunks/index-ad6009f4.js","_app/immutable/chunks/singletons-463c49f8.js"],"stylesheets":[]},
		nodes: [
			() => import('./chunks/0-b4e93a72.js'),
			() => import('./chunks/1-70c5c740.js'),
			() => import('./chunks/2-86a16b73.js')
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				names: [],
				types: [],
				optional: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			},
			{
				id: "/poslatEmail",
				pattern: /^\/poslatEmail\/?$/,
				names: [],
				types: [],
				optional: [],
				page: null,
				endpoint: () => import('./chunks/_server.ts-4e968410.js')
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};

export { manifest };
//# sourceMappingURL=manifest.js.map
