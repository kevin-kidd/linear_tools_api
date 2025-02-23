import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";
import { bearerAuth } from "hono/bearer-auth";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import { CommentBody, AssignBody, getOpenApiSchema } from "./schemas";
import { LinearService } from "./services/linear";

type Bindings = {
	API_URL: string;
	DIFY_API_TOKEN: string;
	MANAGER_BOT_API_KEY: string;
	BUG_BOT_API_KEY: string;
	FEATURE_BOT_API_KEY: string;
	IMPROVEMENT_BOT_API_KEY: string;
};

type Variables = {
	linearService: LinearService;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Swagger UI
app.get("/ui", swaggerUI({ url: "/doc" }));

// OpenAPI Documentation
app.get("/doc", (c) => c.json(getOpenApiSchema(c.env.API_URL)));

// Initialize LinearService middleware
const withLinearService = async (
	c: Context<{ Bindings: Bindings; Variables: Variables }>,
	next: () => Promise<void>,
) => {
	const linearService = new LinearService({
		MANAGER_BOT_API_KEY: c.env.MANAGER_BOT_API_KEY,
		BUG_BOT_API_KEY: c.env.BUG_BOT_API_KEY,
		FEATURE_BOT_API_KEY: c.env.FEATURE_BOT_API_KEY,
		IMPROVEMENT_BOT_API_KEY: c.env.IMPROVEMENT_BOT_API_KEY,
	});
	c.set("linearService", linearService);
	await next();
};

// Auth middleware
const auth = (
	c: Context<{ Bindings: Bindings }>,
	next: () => Promise<void>,
) => {
	return bearerAuth({ token: c.env.DIFY_API_TOKEN })(c, next);
};

// API Routes
app.get("/issues/:issueId", auth, withLinearService, async (c) => {
	const issueId = c.req.param("issueId");
	const linearService = c.get("linearService") as LinearService;
	const result = await linearService.getIssue(issueId);
	if (!result.success) {
		return c.json({ error: result.error }, 404);
	}
	return c.json(result.data);
});

app.post(
	"/issues/:issueId/comment",
	auth,
	withLinearService,
	zValidator("json", CommentBody),
	async (c) => {
		const issueId = c.req.param("issueId");
		const { agentId, comment } = c.req.valid("json");
		const linearService = c.get("linearService") as LinearService;
		const result = await linearService.commentOnIssue(
			issueId,
			agentId,
			comment,
		);
		if (!result.success) {
			return c.json({ error: result.error }, 404);
		}
		return c.json(result.data);
	},
);

app.post(
	"/issues/:issueId/assign",
	auth,
	withLinearService,
	zValidator("json", AssignBody),
	async (c) => {
		const issueId = c.req.param("issueId");
		const { agentId } = c.req.valid("json");
		const linearService = c.get("linearService") as LinearService;
		const result = await linearService.assignIssue(issueId, agentId);
		if (!result.success) {
			return c.json({ error: result.error }, 404);
		}
		return c.json(result.data);
	},
);

export default app;
