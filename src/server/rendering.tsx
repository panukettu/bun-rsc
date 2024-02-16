import { type ReactNode, Suspense } from "react";
import { renderToReadableStream as renderDOM } from "react-dom/server.edge";
import { createFromReadableStream } from "react-server-dom/client.node";
import {
	type StreamOpts,
	decodeReply,
	renderToReadableStream,
} from "react-server-dom/server.node";
import { root } from "src/build/app-config";
import { Payloader, ServerShell } from "./misc/Shell";
import { getInjectables, injectFiles, injectHTML } from "./rendering-utils";
import type { BuildContext, Injects } from "./types";
const moduleBasePath = "";
const basePathSSR = "/src/";

const opts: StreamOpts = {
	onError(error) {
		console.log("stream error", error);
	},
	onPostpone(reason) {
		console.log("postpone", reason);
	},
};

function toHTML(Tree: React.ReactNode, ctx?: BuildContext) {
	return renderDOM(Tree, {
		bootstrapModules: ctx?.modules.map((m) => `/${m}`) || [],
	});
}

export function toWebPayload(Tree: ReactNode, ctx?: BuildContext) {
	return withInjectionsWeb(
		renderToReadableStream(Tree, moduleBasePath, opts),
		ctx,
	);
}

export function toPayloadAndHTML(tree: ReadableStream, ctx?: BuildContext) {
	const [source, payload] = tree.tee();

	const reader = payload.getReader();
	const promise = reader.read();
	const decoder = new TextDecoder();

	const payloader = (
		<Suspense>
			<Payloader promise={promise} reader={reader} decoder={decoder} />
		</Suspense>
	);

	return toHTML(
		<ServerShell
			html={createFromReadableStream(source, basePathSSR, moduleBasePath)}
			payloader={payloader}
		/>,
		ctx,
	);
}

const actionOpts = ["stale", "href"];
export async function decodeAction(reference: string, body: string) {
	const [filepath, name] = reference.split("#");

	const action = (await import(`${root}/src/${filepath}`))[name];

	if (action.$$typeof !== Symbol.for("react.server.reference")) {
		throw new Error(`Unknown Server Action: ${name}`);
	}

	const args = await decodeReply(body);

	let opts = args[args.length - 1];

	if (
		typeof opts === "object" &&
		Object.keys(opts).some((k) => actionOpts.includes(k))
	) {
		opts = args.pop();
	}
	return {
		action,
		args,
		opts,
	};
}

function withInjectionsWeb(stream: ReadableStream, ctx?: BuildContext) {
	if (!ctx) return stream;

	const encoder = new TextEncoder();
	const injected: Injects = {
		files: false,
		head: false,
	};

	const injectables = getInjectables(ctx);
	return stream.pipeThrough(
		new TransformStream({
			transform(chunk, controller) {
				const enqueue = (val: string) =>
					controller.enqueue(encoder.encode(val));
				if (!injected.files) {
					injected.files = injectFiles(enqueue, injectables.files);
				}
				if (!injected.head) {
					injected.head = injectHTML(
						enqueue,
						"html",
						"head",
						chunk,
						injectables.preloads,
						injectables.styles,
					);
					if (!injected.head) controller.enqueue(chunk);
				} else {
					controller.enqueue(chunk);
				}
			},
		}),
	);
}
