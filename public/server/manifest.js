const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		entry: {"file":"_app/immutable/start-2ffd36bd.js","imports":["_app/immutable/start-2ffd36bd.js","_app/immutable/chunks/index-80996cf8.js","_app/immutable/chunks/singletons-bbbf9818.js"],"stylesheets":[]},
		nodes: [
			() => import('./chunks/0-9568c804.js'),
			() => import('./chunks/1-58bc16a9.js'),
			() => import('./chunks/2-d450a47c.js')
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
