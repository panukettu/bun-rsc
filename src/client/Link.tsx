"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "./Router";
import type { LinkProps, Links, SpeculationRules } from "./types";

export function Link<Href extends Links>({
	pre = "render",
	...props
}: LinkProps<Href>) {
	const kind = useMemo(() => {
		return {
			partial:
				(props.href !== undefined && !props.href?.startsWith("/")) ||
				props.href === null,
			external: props.href?.startsWith("http"),
		};
	}, [props.href]);

	const router = useRouter();

	useEffect(() => {
		if (
			process.env.APP_PUBLIC_ENV === "development" ||
			typeof window === "undefined" ||
			kind.partial ||
			kind.external ||
			pre === false ||
			typeof props.href === "undefined" ||
			props.href === ""
		)
			return;

		const target = kind.partial
			? `/_rsc/${props.href === null ? "/" : props.href}`
			: props.href?.slice(1) ?? "";
		const type = pre === "render" ? "prerender" : "prefetch";

		if (HTMLScriptElement.supports?.("speculationrules")) {
			const element = window.document.querySelector(
				'script[type="speculationrules"]',
			);
			let existing = defaultSpeculation;
			if (element) {
				if (element.textContent) existing = JSON.parse(element.innerHTML);
				element.remove();
			}

			const newElement = window.document.createElement("script");
			newElement.setAttribute("type", "speculationrules");
			existing[type][0].urls.push(target === "" ? "/" : target);
			newElement.innerHTML = JSON.stringify(existing);

			window.document.head.appendChild(newElement);
		} else {
			const existing = window.document.querySelector(`link[href="${target}"]`);
			if (!existing) {
				const linkElem = document.createElement("link");
				linkElem.rel = "prefetch";
				linkElem.href = `/${target}`;
				document.head.append(linkElem);
			}
		}
	}, [props.href, kind, pre]);

	if (
		"back" in props &&
		typeof window !== "undefined" &&
		!window.history.length &&
		!props.fallback
	) {
		return props.children;
	}

	if (kind.partial || props.back || props.href === null) {
		return (
			<span
				onClick={() => {
					if (props.back) {
						if (window.history.length > 1) {
							router.back();
						} else if (props.fallback) {
							router.navigate(props.fallback, props.revalidate);
						}
					} else if (typeof props.href !== "undefined") {
						router.navigate(
							(props.href ? props.href : "/") as string,
							props.revalidate,
						);
					}
				}}
				{...props}
				style={{
					cursor: "pointer",
					...(props.style || {}),
				}}
			>
				{props.children}
			</span>
		);
	}
	return (
		<a {...(props as LinkProps<"/">)} href={props.href}>
			{props.children}
		</a>
	);
}

const defaultSpeculation: SpeculationRules = {
	prefetch: [
		{
			source: "list",
			urls: [] as string[],
		},
	],
	prerender: [
		{
			source: "list",
			urls: [] as string[],
		},
	],
};
