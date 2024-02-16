import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import {
	dev,
	errorHandler,
	notFound,
	serverCors,
	staticFolder,
} from "../build/app-config";
import { createAction, createRoute } from "./core";
import { compress } from "./misc";

const server = new Hono();

server.onError(errorHandler);
server.notFound(notFound);

server.use("*", compress("gzip"));

for (const [path, options] of Object.entries(serverCors)) {
	server.use(path, cors(options));
}

if (dev) {
	server.route("/dev", (await import("./server-dev")).default);
}

server.get("/_rsc/*", async (c) => {
	c.header("Content-Type", "application/x-ndjson");
	c.header("Transfer-Encoding", "chunked");
	const response = await createRoute(
		c,
		c.req.path.replace("/_rsc", "").replace(".js", "") as `/${string}`,
		{
			onlyPayload: true,
		},
	);

	return c.body(response as ReadableStream);
});

server.post("/_action", async (c) => {
	const action = c.req.header("rsc-action");
	const location = c.req.header("rsc-location");
	if (!action || !location) {
		throw new HTTPException(400, { message: "Invalid Server Action request" });
	}

	c.header("Content-Type", "application/x-ndjson");
	c.header("Transfer-Encoding", "chunked");

	return c.body(await createAction(c, action, location.slice(1)));
});

server.use(
	"/favicon.ico",
	serveStatic({ path: `./${staticFolder}/favicon.ico` }),
);

server.get(
	`/${staticFolder}/*`,
	serveStatic({
		root: "./",
		rewriteRequestPath(path) {
			if (path.includes("?")) {
				return path.split("?")[0];
			}
			return path;
		},
	}),
);

server.get("/*", async (c) => {
	if (!c.req.header("Accept")?.includes("text/html")) {
		throw new HTTPException(400, { message: "Invalid request" });
	}

	if (c.req.path.includes(".")) {
		throw new HTTPException(400, { message: "Invalid path" });
	}

	c.header("Content-Type", "text/html");
	c.header("Transfer-Encoding", "chunked");

	return c.body(
		(await createRoute(c, c.req.path as `/${string}`)) as ReadableStream,
	);
});

export default server;
