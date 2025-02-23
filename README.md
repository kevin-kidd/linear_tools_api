# Linear Tools API for Dify Workflow

This project provides a CloudFlare Worker API that enables Dify workflow agents to interact with Linear issues. It supports operations like fetching issue details, adding comments, and assigning issues to specific agents.

## Features

- Get issue details including labels and assignee information
- Comment on issues as different agent bots
- Assign issues to specific agent bots
- OpenAPI documentation and Swagger UI
- Built with Hono and TypeScript

## Prerequisites

- Node.js 18+ or Bun
- Wrangler CLI
- Linear API keys for each bot

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   bun install
   ```

3. Configure environment variables in `wrangler.toml`:

   ```toml
   [vars]
   API_URL = "your-api-url"
   LINEAR_API_KEY = "your-linear-api-key"
   MANAGER_BOT_API_KEY = "manager-bot-api-key"
   BUG_BOT_API_KEY = "bug-bot-api-key"
   FEATURE_BOT_API_KEY = "feature-bot-api-key"
   IMPROVEMENT_BOT_API_KEY = "improvement-bot-api-key"
   ```

## Development

Run the development server:

```bash
bun run dev
```

## Deployment

Deploy to CloudFlare Workers:

```bash
bun run deploy
```

## API Documentation

Once running, you can access:

- Swagger UI: `/ui`
- OpenAPI spec: `/doc`

## API Endpoints

### Get Issue Details

```http
GET /api/issues/{issueId}
```

### Comment on Issue

```http
POST /api/issues/{issueId}/comment
Content-Type: application/json

{
  "agentId": "MANAGER_BOT",
  "comment": "This is a comment"
}
```

### Assign Issue

```http
POST /api/issues/{issueId}/assign
Content-Type: application/json

{
  "agentId": "BUG_BOT"
}
```

## Agent Types

- `MANAGER_BOT`: Handles task assignment
- `BUG_BOT`: Handles bug-labeled issues
- `FEATURE_BOT`: Handles feature-labeled issues
- `IMPROVEMENT_BOT`: Handles improvement-labeled issues
