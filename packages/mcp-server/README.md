# feedbacks.dev MCP Server

Connect MCP-compatible coding agents to the hosted feedbacks.dev REST API.

The server uses a project API key and never connects directly to Supabase. Project API keys belong only in trusted agent, CLI, or backend configuration.

```bash
npm exec --yes \
  --package=https://app.feedbacks.dev/mcp/feedbacks-mcp-server-1.0.0.tgz \
  -- feedbacks-mcp --api-key fb_live_your_key
```

See [the full MCP setup guide](https://github.com/WarriorSushi/feedbacks.dev-2026/blob/main/docs/MCP.md) for Claude Code, Cursor, and generic stdio client configuration.
