import { watch } from "node:fs";
import { Hono } from "hono";
import { buildCountFile } from "src/build/app-config";

let stream = new ReadableStream({
	start(controller) {
		let count = 0;
		watch(buildCountFile).on("change", () => {
			controller.enqueue(`event: update\ndata: hello\nid: ${count++}\n\n`);
		});
	},
});

const devRoute = new Hono();

devRoute.get("/sse", (ctx) => {
	Bun.gc(true);
	const [s1, s2] = stream.tee();
	stream = s1;

	ctx.header("Transfer-Encoding", "chunked");
	ctx.header("Content-Type", "text/event-stream");
	ctx.header("Cache-Control", "no-cache");
	ctx.header("Connection", "keep-alive");
	return ctx.body(s2);
});

export default devRoute;
