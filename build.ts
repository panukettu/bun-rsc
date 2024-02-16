import { build } from "tsup";
import { configs } from "./configs";

for (const config of Object.values(configs())) {
	await build(config);
}

if (!process.env.WATCH) {
	process.exit(0);
}
