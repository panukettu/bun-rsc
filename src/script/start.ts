import { buildPages } from "../build";
import { watch } from "../build/app-config";

buildPages(watch).catch((e) => {
	console.error("error while running bun-rsc ", e);
});
