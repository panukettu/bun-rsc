import { Hono } from "hono";

export const createServer = async (server: Hono, root: string) => {
	const api = (await import(`${root}/src/server`)).default;
	const app = new Hono();
	app.route("/api", api);
	app.route("/", server);

	return app;
};
