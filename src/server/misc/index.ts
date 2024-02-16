import { root } from "src/build/app-config";

export const clearModuleCache = (folder: string) => {
	Object.keys(require.cache)
		.filter((k) => k.startsWith(root + folder))
		.forEach((k) => {
			delete require.cache[k];
		});
};

// @bun

/*! MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */
import zlib from "node:zlib";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

// fyi, Byte streams aren't really implemented anywhere yet
// It only exist as a issue: https://github.com/WICG/compression/issues/31

const compressOpts = {
	chunkSize: 1024,
	flush: zlib.constants.Z_SYNC_FLUSH,
};
export class CompressionStream {
	public readable: ReadableStream;
	public writable: WritableStream;
	constructor(format?: "deflate" | "gzip" | "br") {
		let handle: any;
		if (format === "deflate") {
			handle = zlib.createDeflateRaw(compressOpts);
		}

		if (format === "gzip") {
			handle = zlib.createGzip(compressOpts);
		}

		if (format === "br") {
			handle = zlib.createBrotliCompress(compressOpts);
		}

		if (format === undefined) {
			handle = zlib.createDeflateRaw(compressOpts);
		}

		this.readable = new ReadableStream({
			type: "bytes",
			start(ctrl) {
				handle.on("data", (chunk: any) => ctrl.enqueue(chunk));
				handle.once("end", () => ctrl.close());
			},
		});
		this.writable = new WritableStream({
			write: (chunk) => handle.write(chunk),
			close: () => handle.end(),
		});
	}
}

export const compress =
	(format: "deflate" | "gzip" | "br" = "gzip"): MiddlewareHandler =>
	async (c, next) => {
		const comp = new CompressionStream(format);
		await next();
		const accepted = c.req.header("Accept-Encoding");
		const acceptsEncoding = accepted?.includes(format);
		if (!acceptsEncoding || !c.res.body) {
			return;
		}
		c.res = new Response(ensureStream(c.res.body).pipeThrough(comp), {
			headers: c.res.headers,
		});
		c.res.headers.set("Content-Encoding", format);
	};

const ensureStream = (
	res: any,
	message = "Invalid Server Component result",
) => {
	if (!(res instanceof ReadableStream)) {
		throw new HTTPException(500, {
			message,
		});
	}
	return res;
};
