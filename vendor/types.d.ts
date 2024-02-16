declare module "react-server-dom/client.browser" {
	export function createFromReadableStream(
		stream: ReadableStream,
		opts: {
			moduleBasePath?: string;
			callServer?: any;
		},
	): Promise<React.ElementType>;
	export function createFromFetch<T = any>(
		fetch: ReturnType<typeof window.fetch>,
		opts: {
			moduleBasePath?: string;
			callServer?: any;
		},
	): Promise<T>;

	export function encodeReply(reply: any): Promise<string>;
}

declare module "react-server-dom/client.node" {
	import type { ReactNode } from "react";
	export function createFromNodeStream(
		stream: Readable,
		moduleRootPath: string,
		moduleBaseURL: { prefix?: string | null } | string,
		opts?: { nonce?: string },
	): ReactNode;

	export function createFromReadableStream(
		stream: ReadableStream,
		moduleRootPath: string,
		moduleBaseURL: { prefix?: string | null } | string,
		opts?: { nonce?: string },
	): ReactNode;
}

declare module "react-dom/server.edge" {
	export function renderToReadableStream(
		tree: ReactNode | Record<string, any>,
		opts: {
			identifierPrefix?: string;
			namespaceURI?: string;
			nonce?: string;
			bootstrapScriptContent?: string;
			bootstrapScripts?: string[];
			bootstrapModules?: string[];
			progressiveChunkSize?: number;
			formState?: any;
			importMap?: Record<string, string>;
			signal?: AbortSignal;
			// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
			onError?: (error: unknown, errorInfo: ErrorInfo) => string | void;
			onHeaders?: (headers: Headers) => void;
			onPostpone?: (reason: string) => void;
			onShellReady?: () => void;
			unstable_externalRuntimeSrc?: string;
		},
	): ReadableStream;
}

declare module "react-server-dom/server.node" {
	export type StreamOpts = {
		onError?: (error: any) => void;
		onPostpone?: (reason: string) => void;
		context?: RSCContext;
		identifierPrefix?: string;
	};

	export function createClientModuleProxy(
		moduleId: string,
		exportName: string,
		isLib: boolean,
		root: string,
	);

	export function renderToReadableStream<T = any>(
		model: T,
		moduleBasePath: string,
		options: StreamOpts,
	): ReadableStream;

	export function renderToPipeableStream<T = any>(
		model: T,
		moduleBasePath: string,
		opts: StreamOpts,
	): {
		pipe: (destination: Writable) => Writable;
		abort: (reason?: unknown) => void;
	};

	export function decodeReply(reply: any): Promise<any[]>;

	export function registerClientReference(
		el: any,
		moduleId: string,
		exportName: string,
		isLib?: boolean,
		root?: string,
	): void;
	export function registerServerReference(
		el: any,
		moduleId: string,
		exportName: string,
	): void;
}
