const path = "./src/client/Link.tsx";
import { existsSync } from "node:fs";

async function test() {
	const existsBun = await Bun.file(path).exists();
	const existsNode = existsSync(path);

	console.log({
		existsNode,
		existsBun,
	});
}

test();
