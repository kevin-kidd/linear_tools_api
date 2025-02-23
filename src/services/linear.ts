import { LinearClient } from "@linear/sdk";

export type AgentType =
	| "MANAGER_BOT"
	| "BUG_BOT"
	| "FEATURE_BOT"
	| "IMPROVEMENT_BOT";

interface LinearServiceConfig {
	MANAGER_BOT_API_KEY: string;
	BUG_BOT_API_KEY: string;
	FEATURE_BOT_API_KEY: string;
	IMPROVEMENT_BOT_API_KEY: string;
}

export class LinearService {
	private clients: Record<AgentType, LinearClient>;

	constructor(config: LinearServiceConfig) {
		this.clients = {
			MANAGER_BOT: new LinearClient({ apiKey: config.MANAGER_BOT_API_KEY }),
			BUG_BOT: new LinearClient({ apiKey: config.BUG_BOT_API_KEY }),
			FEATURE_BOT: new LinearClient({ apiKey: config.FEATURE_BOT_API_KEY }),
			IMPROVEMENT_BOT: new LinearClient({
				apiKey: config.IMPROVEMENT_BOT_API_KEY,
			}),
		};
	}

	async getIssue(issueId: string) {
		try {
			// Use manager bot for fetching issue details
			const client = this.clients.MANAGER_BOT;
			const issue = await client.issue(issueId);

			if (!issue) {
				throw new Error("Issue not found");
			}

			const [issueData, labels, assignee] = await Promise.all([
				issue,
				issue.labels(),
				issue.assignee,
			]);

			const labelNames = labels.nodes.map((label) => label.name);

			return {
				success: true,
				data: {
					id: issueData.id,
					title: issueData.title,
					description: issueData.description,
					labels: labelNames,
					state: issueData.state,
					assignee: assignee
						? {
								id: assignee.id,
								name: assignee.name,
							}
						: null,
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to fetch issue",
			};
		}
	}

	async commentOnIssue(issueId: string, agentId: AgentType, comment: string) {
		try {
			const client = this.clients[agentId];
			const issue = await client.issue(issueId);

			if (!issue) {
				throw new Error("Issue not found");
			}

			await client.createComment({
				issueId: issue.id,
				body: comment,
			});

			return {
				success: true,
				data: { message: "Comment added successfully" },
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to add comment",
			};
		}
	}

	async assignIssue(issueId: string, agentId: AgentType) {
		try {
			const client = this.clients[agentId];
			const [issue, me] = await Promise.all([
				client.issue(issueId),
				client.viewer,
			]);

			if (!issue) {
				throw new Error("Issue not found");
			}

			await client.updateIssue(issue.id, {
				assigneeId: me.id,
			});

			return {
				success: true,
				data: { message: "Issue assigned successfully" },
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "Failed to assign issue",
			};
		}
	}
}
