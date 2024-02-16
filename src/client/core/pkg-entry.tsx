"use client";

import { useState } from "react";
import { hydrateRoot } from "react-dom/client";
import {
	createFromFetch,
	createFromReadableStream,
} from "react-server-dom/client.browser";
import { ErrorBoundary } from "../ErrorBoundary";
import { RouterContext, type RouterState } from "../Router";
import type { SetLocation } from "../types";
import { IS_DEV, useClientEffect } from "../utils";
import { Shell, initialize } from "./pkg-bootstrap";

const { stream, opts, routeCache } = initialize();

let ClientShell: any = Shell;

if (IS_DEV) {
	const DEV = await import("./pkg-dev");
	ClientShell = DEV.default;
}

type Location = {
	route: string;
	search: string;
};
let skipCache = false;
export const revalidateNext = () => {
	routeCache.clear();
};
function navigator(setLocation: SetLocation) {
	return (nextLocation: string, revalidate?: boolean | "next") => {
		const url = new URL(
			nextLocation.replaceAll("//", "/"),
			window.location.origin,
		);
		skipCache = !!revalidate || skipCache;
		setLocation({
			route: url.pathname,
			search: url.search,
		});
		window.document.querySelector('script[type="speculationrules"]')?.remove();
		window.history.pushState(null, "", url.href);
	};
}

const Router = (props: Location) => {
	const [location, setLocation] = useState<RouterState>({
		route: props.route,
		search: props.search,
	});
	const navigate = navigator(setLocation);

	useClientEffect(() => {
		window.addEventListener("popstate", (e) => {
			const url = new URL(window.location.href);

			setLocation((loc) => ({
				...loc,
				route: url.pathname,
				search: url.search,
			}));

			e.preventDefault();
		});
	}, []);

	return (
		<RouterContext.Provider
			value={{
				location,
				revalidateNext,
				navigate,
				back: () => window.history.back(),
			}}
		>
			<ErrorBoundary>
				<Renderer
					navigate={navigate}
					target={location.route + location.search}
					setLocation={setLocation}
				/>
			</ErrorBoundary>
		</RouterContext.Provider>
	);
};

type RendererProps = {
	target: string;
	setLocation: SetLocation;
	navigate: any;
};

const Renderer = ({ target, setLocation, navigate }: RendererProps) => {
	let response = routeCache.get(target);
	if (routeCache.size === 0 && !stream.locked) {
		response = createFromReadableStream(stream, opts);
		routeCache.set(target, response);
	}

	if (!response) {
		response = createFromFetch(fetch(`/_rsc${target}`), opts);
		routeCache.set(target, response);
	}

	if (!response) {
		return null;
	}
	return (
		<ClientShell
			data={response}
			setLocation={setLocation}
			navigate={navigate}
		/>
	);
};

hydrateRoot(
	document,
	<Router route={window.location.pathname} search={window.location.search} />,
);
