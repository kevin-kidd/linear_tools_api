import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Common schemas
export const IssueAssignee = z
	.object({
		id: z.string().openapi({ type: "string" }),
		name: z.string().openapi({ type: "string" }),
	})
	.openapi({ description: "Issue assignee details" });

export const IssueDetails = z
	.object({
		id: z.string().openapi({ type: "string" }),
		title: z.string().openapi({ type: "string" }),
		description: z.string().nullable().openapi({ type: "string" }),
		labels: z
			.array(z.string())
			.openapi({ type: "array", items: { type: "string" } }),
		state: z.string().openapi({ type: "string" }),
		assignee: IssueAssignee.nullable(),
	})
	.openapi({ description: "Issue details" });

// Request schemas
export const CommentBody = z
	.object({
		agentId: z
			.enum(["MANAGER_BOT", "BUG_BOT", "FEATURE_BOT", "IMPROVEMENT_BOT"])
			.openapi({
				type: "string",
				enum: ["MANAGER_BOT", "BUG_BOT", "FEATURE_BOT", "IMPROVEMENT_BOT"],
				description: "The agent that will make the comment",
			}),
		comment: z
			.string()
			.openapi({ type: "string", description: "The comment text to add" }),
	})
	.openapi({ description: "Comment request body" });

export const AssignBody = z
	.object({
		agentId: z
			.enum(["MANAGER_BOT", "BUG_BOT", "FEATURE_BOT", "IMPROVEMENT_BOT"])
			.openapi({
				type: "string",
				enum: ["MANAGER_BOT", "BUG_BOT", "FEATURE_BOT", "IMPROVEMENT_BOT"],
				description: "The agent to assign the issue to",
			}),
	})
	.openapi({ description: "Assign request body" });

// Response schemas
export const ErrorResponse = z
	.object({
		error: z.string().openapi({ type: "string" }),
	})
	.openapi({ description: "Error response" });

export const MessageResponse = z
	.object({
		message: z.string().openapi({ type: "string" }),
	})
	.openapi({ description: "Success message response" });

// OpenAPI schema
export const getOpenApiSchema = (serverUrl: string) => ({
	openapi: "3.1.0",
	info: {
		title: "Linear Issues API",
		version: "1.0.0",
		description: "API for managing Linear issues",
	},
	servers: [
		{
			url: serverUrl,
			description: "Production server",
		},
	],
	security: [{ bearerAuth: [] }],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: "http",
				scheme: "bearer",
				description: "Enter your API token",
			},
		},
		schemas: {
			IssueDetails: {
				type: "object",
				properties: {
					id: { type: "string" },
					title: { type: "string" },
					description: { type: "string", nullable: true },
					labels: {
						type: "array",
						items: { type: "string" },
					},
					state: { type: "string" },
					assignee: {
						type: "object",
						nullable: true,
						properties: {
							id: { type: "string" },
							name: { type: "string" },
						},
						required: ["id", "name"],
					},
				},
				required: ["id", "title", "description", "labels", "state", "assignee"],
			},
			CommentBody: {
				type: "object",
				properties: {
					agentId: {
						type: "string",
						enum: ["MANAGER_BOT", "BUG_BOT", "FEATURE_BOT", "IMPROVEMENT_BOT"],
						description: "The agent that will make the comment",
					},
					comment: {
						type: "string",
						description: "The comment text to add",
					},
				},
				required: ["agentId", "comment"],
			},
			AssignBody: {
				type: "object",
				properties: {
					agentId: {
						type: "string",
						enum: ["MANAGER_BOT", "BUG_BOT", "FEATURE_BOT", "IMPROVEMENT_BOT"],
						description: "The agent to assign the issue to",
					},
				},
				required: ["agentId"],
			},
			ErrorResponse: {
				type: "object",
				properties: {
					error: { type: "string" },
				},
				required: ["error"],
			},
			MessageResponse: {
				type: "object",
				properties: {
					message: { type: "string" },
				},
				required: ["message"],
			},
		},
	},
	paths: {
		"/issues/{issueId}": {
			get: {
				operationId: "getIssueDetails",
				summary: "Get issue details",
				description: "Retrieves details of a specific Linear issue",
				parameters: [
					{
						name: "issueId",
						in: "path",
						required: true,
						description: "The ID of the Linear issue",
						schema: { type: "string" },
					},
				],
				responses: {
					"200": {
						description: "Issue details",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/IssueDetails" },
							},
						},
					},
					"404": {
						description: "Issue not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
		"/issues/{issueId}/comment": {
			post: {
				operationId: "addIssueComment",
				summary: "Add a comment to an issue",
				description: "Adds a comment to a Linear issue using a specific agent",
				parameters: [
					{
						name: "issueId",
						in: "path",
						required: true,
						description: "The ID of the Linear issue",
						schema: { type: "string" },
					},
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/CommentBody" },
						},
					},
				},
				responses: {
					"200": {
						description: "Comment added successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/MessageResponse" },
							},
						},
					},
					"404": {
						description: "Issue not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
		"/issues/{issueId}/assign": {
			post: {
				operationId: "assignIssue",
				summary: "Assign an issue to an agent",
				description: "Assigns a Linear issue to a specific agent",
				parameters: [
					{
						name: "issueId",
						in: "path",
						required: true,
						description: "The ID of the Linear issue",
						schema: { type: "string" },
					},
				],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/AssignBody" },
						},
					},
				},
				responses: {
					"200": {
						description: "Issue assigned successfully",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/MessageResponse" },
							},
						},
					},
					"404": {
						description: "Issue not found",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
				},
			},
		},
	},
});
