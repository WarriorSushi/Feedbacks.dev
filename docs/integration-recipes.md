# Integration Recipes

Last updated: 2026-06-22

Use this as the stable launch reference for promoted routing destinations. `feedbacks.dev` currently ships Slack, Discord, GitHub Issues, and generic webhooks with immediate or daily digest delivery. Linear is not a first-class integration.

## Key Handling

- Browser-safe project keys belong in widget snippets.
- Project API keys belong only in trusted backends, CLI tools, MCP config, and server-side automation.
- Generic webhook signing secrets are only used server-side to sign outgoing deliveries.

## Slack

1. Create a Slack incoming webhook for the channel.
2. Open a project in `feedbacks.dev`.
3. Go to Integrations.
4. Add a Slack endpoint and paste the Slack webhook URL.
5. Send a test delivery.
6. Check Recent delivery history for HTTP status and replay support.

Use rules when only bugs, low ratings, or tagged feedback should route to Slack.

## Discord

1. Create a Discord channel webhook.
2. Open project Integrations.
3. Add a Discord endpoint and paste the webhook URL.
4. Send a test delivery.
5. Check Recent delivery history before relying on it for production routing.

Discord deliveries use Discord's native webhook shape.

## GitHub Issues

1. Create a GitHub token with permission to create issues in the target repo.
2. Open project Integrations.
3. Add a GitHub Issues endpoint.
4. Enter `owner/repo`, token, and optional comma-separated labels.
5. Send a test delivery.
6. Confirm the issue appears and the delivery log records success.

Do not paste GitHub tokens into browser widget snippets, docs pages, or public issue comments.

## Linear Via Generic Webhook

Linear is deferred as a first-class integration. Until it ships, use a generic webhook pointed at your own backend or automation platform.

Recommended flow:

1. Add a generic webhook endpoint in project Integrations.
2. Enable HMAC signing with a shared secret.
3. In your backend, verify `X-Feedbacks-Timestamp` and `X-Feedbacks-Signature`.
4. Transform `feedback.new` payloads into Linear issues with Linear's API.
5. Return a `2xx` response only after the Linear request succeeds.

This keeps Linear credentials out of `feedbacks.dev` and gives your team full control over labels, teams, projects, and duplicate handling.

## Webhook Payload

Generic webhooks receive the canonical payload:

```json
{
  "version": "2026-06-22",
  "event": "feedback.new",
  "feedback": {
    "id": "feedback-id",
    "message": "Export fails on large CSV files",
    "type": "bug",
    "priority": "high",
    "status": "new",
    "url": "https://example.com/reports"
  },
  "project": {
    "id": "project-id",
    "name": "Example App"
  },
  "timestamp": "2026-06-22T12:00:00.000Z"
}
```

Events currently emitted:

- `feedback.new`
- `feedback.test`
- `feedback.digest`

## Digest Delivery

Set an endpoint's delivery timing to `Daily digest` when a destination should receive one batched delivery from the webhook cron instead of one delivery per feedback event.

Digest payloads use the same versioned envelope:

```json
{
  "version": "2026-06-22",
  "event": "feedback.digest",
  "feedbacks": [
    {
      "id": "feedback-id",
      "message": "Export fails on large CSV files",
      "type": "bug",
      "priority": "high"
    }
  ],
  "project": {
    "id": "project-id",
    "name": "Example App"
  },
  "timestamp": "2026-06-22T13:00:00.000Z",
  "window": {
    "start": "2026-06-22T09:10:00.000Z",
    "end": "2026-06-22T12:45:00.000Z"
  },
  "count": 1
}
```
