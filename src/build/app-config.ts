import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

type CORSOptions = {
	origin: string | string[] | ((origin: string) => string | undefined | null);
	allowMethods?: string[];
	allowHeaders?: string[];
	maxAge?: number;
	credentials?: boolean;
	exposeHeaders?: string[];
};

const config = (await import(`${process.cwd()}/pkg.config.ts`))?.config;

const defaultConfig = {
	static: "static",
	staticOut: "pkg",
	tmp: "out",
	dev: process.env.NODE_ENV !== "production",
	server: {
		port: 3000,
		errorHandler: async (err: Error, ctx: Context) => {
			console.info(`\x1b[4m\x1b[31mError in path -> ${ctx.req.path}\x1b[0m`);
			console.error(err.message, err.stack);
			if (err instanceof HTTPException) {
				return err.getResponse();
			}
			return ctx.text(err.message, 500);
		},
		notFound: async (ctx: Context) => {
			return ctx.text("Not Found", 404);
		},
		cors: {
			"*": {
				origin: `http://localhost:${config?.server?.port || 3000}`,
				allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
				allowHeaders: [],
				exposeHeaders: [],
			},
		},
	},
};

export const appPort = config?.server?.port || defaultConfig.server.port;
export const errorHandler = config?.server.errorHandler;
export const notFound = config?.server.notFound;
export const root = config?.root || process.cwd();

const tmp = config?.tmp || defaultConfig.tmp;
export const staticFolder = config?.static || defaultConfig.static;

const staticOutFolder = config?.staticOut || defaultConfig.staticOut;

export const watch = config?.watch;
export const dev = config?.dev;

export const getPath = (path: string) => {
	return path;

	// return path.replace(process.cwd(), `${process.cwd()}/dist`);
};

export const pkgRoot = `${root}/node_modules/@pkxp/bun-rsc/dist`;
export const tmpPath = `${root}/${tmp}`;

export const buildCountFile = `${tmpPath}/build-count.txt`;
export const staticOut = `${staticFolder}/${staticOutFolder}`;
export const staticOutFullPath = `${root}/${staticOut}`;
export const publicOut = `${root}/${staticFolder}`;
export const staticOutFullServer = `${root}`;

export const serverCors = {
	...defaultConfig.server.cors,
	...(config?.server?.cors || {}),
} as Record<string, CORSOptions>;
