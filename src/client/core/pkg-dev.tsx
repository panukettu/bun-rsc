import { StrictMode, use, useEffect } from "react";
import type { SetLocation } from "../types";
import { IS_DEV, useDevEffect } from "../utils";
import { ctx, routeCache } from "./pkg-bootstrap";

export function useDev(setLocation: SetLocation) {
	useDevEffect(() => {
		const listener = (e: MessageEvent) => {
			if (e.data.type === "update" && +e.data.id !== 0) {
				const url = new URL(window.location.href);
				routeCache.clear();
				setLocation({
					route: url.pathname,
					search: `${url.search}?_r=${e.data.id}`,
				});
			}
		};
		window.addEventListener("message", listener);
		return () => window.removeEventListener("message", listener);
	}, [setLocation]);
}

if (IS_DEV) {
	const evtSource = new EventSource(
		`//localhost:${process.env.APP_PUBLIC_PORT}/dev/sse`,
		{
			withCredentials: true,
		},
	);

	evtSource.addEventListener("error", (event) => {
		console.error("Reload Fail:", event);
		evtSource.close();
	});
	evtSource.addEventListener("update", ({ type, lastEventId }) => {
		window.postMessage(
			{
				type,
				id: lastEventId,
			},
			"/",
		);
	});
}

function DevShell({
	data,
	setLocation,
	navigate,
}: { data: any; navigate: any; setLocation: SetLocation }) {
	if (!IS_DEV) throw new Error("DevShell should only be used in development");
	useDev(setLocation);

	useEffect(() => {
		ctx.navigate = navigate;
	}, [navigate]);

	return <StrictMode>{data instanceof Promise ? use(data) : data}</StrictMode>;
}

export default IS_DEV ? DevShell : null;
