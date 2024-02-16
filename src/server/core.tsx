import type { Context } from "hono";
import { root, staticOut } from "../build/app-config";
import {
	getBuildContext,
	getParentLayout,
	handleSearchParams,
	parsePaths,
} from "./core-utils";
import { ContentShell } from "./misc/Shell";
import { decodeAction, toPayloadAndHTML, toWebPayload } from "./rendering";
import type { BuildContext, Exports } from "./types";

const base = `${root}/src/pages/`;
const defaultOpts = {
	onlyPayload: false,
	onlyElement: false,
} as Partial<{ onlyPayload?: boolean; onlyElement?: boolean }>;

export const createRoute = async (
	reqCtx: Context,
	parsedPath: `/${string}`,
	opts = defaultOpts,
) => {
	const { route, indexPath, params } = parsePaths(base, parsedPath);

	const Page: Exports = { ...(await import(indexPath)) };

	if (!Page.Layout && !Page.Content) {
		throw new Error(`No Layout or Content exists for ${route}`);
	}
	let props = {
		search: handleSearchParams(reqCtx.req.query()),
		params,
		route,
		ctx: reqCtx,
	};

	const pages = new Set<string>([route]);

	if (!Page.Layout) {
		const Parent: Exports & { ctx: string } = await getParentLayout(indexPath);
		if (!Parent.Layout) {
			throw new Error(`No Layout exists for ${route}`);
		}

		props = { ...(Parent?.Props ? Parent.Props(props) : {}), ...props };
		Page.Layout = Parent.Layout;

		pages.add(Parent.ctx);
	}

	const finalProps = { ...props, ...(Page?.Props ? Page.Props(props) : {}) };
	const ctx = await getBuildContext(pages);

	const el = (
		<Page.Layout {...finalProps}>
			{(_props: any) => (
				<ContentShell
					fallback={ctx.fallback && `/${staticOut}/${ctx.fallback}`}
					layoutProps={_props}
				>
					{(resolvedProps) => <Page.Content {...resolvedProps} />}
				</ContentShell>
			)}
		</Page.Layout>
	);

	if (opts.onlyElement) {
		return [el, ctx] as const;
	}
	const payload = toWebPayload(el, ctx);

	if (opts.onlyPayload) {
		return payload;
	}

	return toPayloadAndHTML(payload, ctx);
};

export async function createAction(
	reqCtx: Context,
	reference: string,
	route: string,
) {
	const { opts, args, action } = await decodeAction(
		reference,
		await reqCtx.req.text(),
	);

	let root: JSX.Element | undefined;
	let ctx: BuildContext | undefined;

	if (!opts?.stale || opts?.href != null) {
		const reqPath = opts?.href || `/${route === "index" ? "" : route}`;
		[root, ctx] = (await createRoute(reqCtx, reqPath, {
			onlyElement: true,
		})) as [JSX.Element, BuildContext];
	}

	const returnValue = action.apply(null, args);
	if (returnValue instanceof Promise) {
		await returnValue;
	}

	return toWebPayload({ root, returnValue, formData: null } as any, ctx);
}
