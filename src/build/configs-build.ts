import fs from "node:fs";

import { $, type Server } from "bun";
import { type Options } from "tsup";
import type { ClientFiles } from "../server/types";
import {
	appPort,
	dev,
	getPath,
	publicOut,
	root,
	staticOut,
	staticOutFullPath,
	tmpPath,
} from "./app-config";
import { createServer } from "./server-entry";

let pkgServer: Server | null = null;
let buildCount = 0;

export const did = (id: string) => (dev ? `?_r=${id}` : "");
const tailwindOut = getPath(`${staticOut}/main.css`);
const metafile = getPath(`${tmpPath}/metafile-esm.json`);
const staticOutFull = getPath(staticOutFullPath);
const publicOutFull = getPath(publicOut);
export type PackageFiles = ReturnType<typeof getPackageFiles>;

export const getPackageFiles = (pkgRoot: string) => {
	const bootstrap = [
		{
			inputPath: `file://${pkgRoot}/client/pkg-client.js`,
			fileName: "pkg-client.js",
			lib: true,
			initializer: true,
			outputPath: "@pkxp/bun-rsc/pkg-client",
			page: "*",
		},
	];

	const components = (page: string) => [
		{
			inputPath: `file://${pkgRoot}/client/Link.js`,
			outputPath: "@pkxp/bun-rsc/Link",
			fileName: "Link.js",
			lib: true,
			page: page,
			exportNames: ["Link"],
		},
		{
			inputPath: `file://${pkgRoot}/client/Router.js`,
			outputPath: "@pkxp/bun-rsc/Router",
			fileName: "Router.js",
			lib: true,
			page: "*",
			exportNames: ["Router", "RouterContext", "useRouter"],
		},
		{
			inputPath: `file://${pkgRoot}/client/ErrorBoundary.js`,
			outputPath: "@pkxp/bun-rsc/ErrorBoundary",
			fileName: "ErrorBoundary.js",
			lib: true,
			page: page,
			exportNames: ["ErrorBoundary"],
		},
	];

	return {
		bootstrap,
		components,
	};
};

export const clientConfig = (files: ClientFiles, watch?: boolean): Options => {
	const userEnv = Object.fromEntries(
		Object.entries(process.env).filter<[string, string]>(
			(v): v is [string, string] =>
				v[0].startsWith("APP_PUBLIC_") && typeof v[1] !== "undefined",
		),
	);

	if (!process.env.APP_PUBLIC_PORT) {
		process.env.APP_PUBLIC_PORT = appPort.toString();
	}

	return {
		entry: Object.fromEntries(
			files.map((e) => [
				e.outputPath.replace(`${root}/src/`, ""),
				e.inputPath.replace("file://", ""),
			]),
		),
		format: "esm",
		clean: true,
		outDir: staticOutFull,
		watch: watch && ["src", "pkg.config.ts"],
		minify: dev === false,
		target: "esnext",
		noExternal: [/.+/],
		metafile: true,
		env: {
			APP_PUBLIC_ENV: dev ? "development" : "production",
			APP_PUBLIC_PORT: appPort,
			APP_PUBLIC_STATIC_ASSET_DIR: staticOut,
			...userEnv,
		},
		bundle: true,
		splitting: true,
		config: `${root}/tsconfig.json`,
		dts: false,
		platform: "browser",
		onSuccess: async () => {
			fs.renameSync(`${staticOutFull}/metafile-esm.json`, metafile);
			fs.cpSync(`${process.cwd()}/public/`, publicOutFull, {
				force: true,
				recursive: true,
			});
			return onClientBuildSuccess(files);
		},
	};
};

export async function onClientBuildSuccess(files: ClientFiles) {
	const cssId = Math.random().toString(36).slice(2);
	const tw = $`bunx postcss src/styles/main.css -o ${tailwindOut}`;

	const { outputs } = await import(metafile);
	const app = await createServer(
		(await import("@pkxp/bun-rsc/server")).default,
		root,
	);

	const modules = files.flatMap((e) => {
		const chunks = Object.entries<any>(outputs)
			.filter(([, value]) => {
				if ("entryPoint" in value) {
					if (e.css && value.entryPoint.includes(e.fileName)) return true;
					if (e.lib) {
						return value.entryPoint.includes(e.fileName);
					}
					return e.inputPath.includes(value.entryPoint);
				}
				if ("inputs" in value) {
					return Object.keys(value.inputs).find((i) =>
						e.lib ? i.includes(e.fileName) : e.inputPath.includes(i),
					);
				}
			})
			.flatMap(([key, value]) => {
				if ("cssBundle" in value) {
					return [key, value.cssBundle as string];
				}

				if (key.includes(".css")) return [key];

				return [key];
			});

		if (!chunks.length) {
			throw new Error(`build: could not find chunks for ${e.fileName}`);
		}

		const out = {
			...e,
			chunks: chunks,
		};

		if (e.exportNames && e.exportNames.length > 1) {
			return e.exportNames.map((n) => {
				return {
					...out,
					exportName: n,
				};
			});
		}

		return {
			...out,
			exportName: e.exportNames?.[0] ?? null,
		};
	});

	await tw;
	const twName = dev ? `${tailwindOut}?${cssId}` : tailwindOut;
	await Promise.all([
		Bun.write(
			`${tmpPath}/build-manifest.json`,
			JSON.stringify({
				modules,
				bootstrap: {
					js: modules.filter((r) => r.initializer).map((r) => r.chunks[0]),
					css: [twName],
				},
			}),
		),
		dev
			? Bun.write(`${tmpPath}/build-count.txt`, JSON.stringify(buildCount++))
			: Promise.resolve(),
	]);

	if (dev) {
		Object.keys(require.cache)
			.filter((k) => k.includes(`${root}/src`) || k.includes(tmpPath))
			.map((k) => {
				delete require.cache[k];
			});
	}

	if (!pkgServer) {
		pkgServer = Bun.serve({
			development: dev,
			fetch: app.fetch,
			id: "pkg",
			port: appPort,
		});
	} else if (dev) {
		pkgServer.reload({
			fetch: app.fetch,
			port: appPort,
		});
	}

	console.log(`Serving -> http://localhost:${appPort}`);

	return () => {
		// pkgServer?.stop();
		// userServer?.stop();
	};
}
