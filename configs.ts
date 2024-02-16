import type { Options } from "tsup";

export const configs = (): Record<string, Options> => {
	return {
		client: {
			entry: {
				"pkg-client": "src/client/core/pkg-entry.tsx",
				types: "src/client/types.ts",
				"type-extensions": "src/client/extensions.d.ts",
				Link: "src/client/Link.tsx",
				ErrorBoundary: "src/client/ErrorBoundary.tsx",
				Router: "src/client/Router.tsx",
			},
			format: ["esm"],
			target: "esnext",
			skipNodeModulesBundle: true,
			clean: true,
			outDir: "dist/client",
			watch: !!process.env.WATCH,
			bundle: true,
			platform: "browser",
			dts: true,
			config: "tsconfig.json",
			async onSuccess() {
				Bun.gc(true);
			},
		},
		server: {
			entry: {
				index: "src/server/server.ts",
				builder: "src/build/index.ts",
				types: "src/server/types.ts",
				"server-entry": "src/build/server-entry.ts",
				start: "src/script/start.ts",
				"bun.start": "src/script/bun-start.ts",
			},
			format: ["esm"],
			target: "esnext",
			skipNodeModulesBundle: false,
			external: [/^@pkxp/, /bun$/],
			clean: true,
			outDir: "dist/server",
			watch: !!process.env.WATCH,
			bundle: true,
			platform: "node",
			dts: true,
			config: "tsconfig.json",
			async onSuccess() {
				Bun.gc(true);
			},
		},
	};
};
