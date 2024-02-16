import { type DependencyList, type EffectCallback, useEffect } from "react";

export const IS_DEV = process.env.APP_PUBLIC_ENV === "development";
export const IS_BROWSER = typeof window !== "undefined";

export const useClientEffect = (fn: EffectCallback, deps?: DependencyList) =>
	useEffect(IS_BROWSER ? fn : () => {}, deps);

export const useDevEffect = (fn: EffectCallback, deps?: DependencyList) =>
	useEffect(IS_DEV ? fn : () => {}, deps);
