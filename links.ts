import { $ } from "bun";

const unlink = process.argv[2] === "unlink";
if (unlink) {
	await $`cd vendor/react && bun unlink`;
	await $`cd vendor/react-dom && bun unlink`;
	await $`cd vendor/server-dom && bun unlink`;
	await $`bun remove react react-dom react-server-dom`;
	await $`bun a react@npm:@pkxp/react react-dom@npm:@pkxp/react-dom react-server-dom@npm:@pkxp/react-server-dom`;
} else {
	await $`cd vendor/react && bun link`;
	await $`cd vendor/react-dom && bun link`;
	await $`cd vendor/server-dom && bun link`;
	await $`bun remove react react-dom react-server-dom`;
	await $`bun a react@link:@pkxp/react react-dom@link:@pkxp/react-dom react-server-dom@link:@pkxp/react-server-dom`;
}

process.exit(0);
