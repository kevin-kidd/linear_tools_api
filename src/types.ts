import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

export const AgentType = z
	.enum(["MANAGER_BOT", "BUG_BOT", "FEATURE_BOT", "IMPROVEMENT_BOT"])
	.openapi({ description: "The type of agent" });

export type AgentType = z.infer<typeof AgentType>;

// Base schemas for API responses
export const ErrorResponse = z
	.object({
		success: z.literal(false),
		error: z.string(),
	})
	.openapi({ description: "Error response" });

export const SuccessResponse = <T extends z.ZodType>(dataSchema: T) =>
	z
		.object({
			success: z.literal(true),
			data: dataSchema,
		})
		.openapi({ description: "Success response" });

// Issue schemas
export const IssueAssignee = z
	.object({
		id: z.string(),
		name: z.string(),
	})
	.openapi({ description: "Issue assignee details" });

export const IssueDetails = z
	.object({
		id: z.string(),
		title: z.string(),
		description: z.string().nullable(),
		labels: z.array(z.string()),
		state: z.string(),
		assignee: IssueAssignee.nullable(),
	})
	.openapi({ description: "Issue details" });

// Request schemas
export const GetIssueParams = z
	.object({
		issueId: z.string().describe("The ID of the issue to fetch"),
	})
	.openapi({ description: "Get issue parameters" });

export const CommentIssueBody = z
	.object({
		agentId: AgentType.describe("The ID of the agent making the comment"),
		comment: z.string().describe("The comment text to add"),
	})
	.openapi({ description: "Comment issue request body" });

export const AssignIssueBody = z
	.object({
		agentId: AgentType.describe("The ID of the agent to assign the issue to"),
	})
	.openapi({ description: "Assign issue request body" });

// Response schemas
export const GetIssueResponse = z
	.discriminatedUnion("success", [SuccessResponse(IssueDetails), ErrorResponse])
	.openapi({ description: "Get issue response" });

export const CommentIssueResponse = z
	.discriminatedUnion("success", [
		SuccessResponse(z.object({ message: z.string() })),
		ErrorResponse,
	])
	.openapi({ description: "Comment issue response" });

export const AssignIssueResponse = z
	.discriminatedUnion("success", [
		SuccessResponse(z.object({ message: z.string() })),
		ErrorResponse,
	])
	.openapi({ description: "Assign issue response" });
