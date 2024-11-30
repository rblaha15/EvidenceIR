declare global {
	export interface ObjectConstructor {
		recursiveKeys: (o: {}) => string[];
	}
}
export {}