# Guild Logger Plugin

A Discord bot plugin that logs guild join and leave events to a webhook.

## Features

- Logs when the bot joins a guild with detailed information
- Logs when the bot leaves a guild with detailed information
- Configurable webhook URL through dashboard
- Owner-only plugin for security
- Internationalization support

## Plugin Structure

```
guild-logger/
├── package.json          # Plugin metadata and dependencies
|-- config.json           # Plugin configuration schema
├── README.md             # Documentation
├── bot/
│   ├── index.js          # Bot plugin configuration
│   ├── events/
│   │   ├── guildCreate.js
│   │   └── guildDelete.js
│   └── locales/
│       ├── en-US.json    # Bot-specific English translations
│       └── fr-FR.json    # Bot-specific French translations
├── dashboard/
│   ├── index.js          # Dashboard plugin configuration
│   ├── router.js         # Express routes
│   ├── view.ejs          # Dashboard view
│   └── locales/
│       ├── en-US.json    # Dashboard-specific English translations
│       └── fr-FR.json    # Dashboard-specific French translations
```

## Configuration

```json
{
    "WEBHOOK_URL": "https://discord.com/api/webhooks/your_webhook_id/your_webhook_token" // Discord webhook URL to send logs to
}
```

### Required Permissions

- Bot must have permission to fetch guild information
- Webhook URL must be valid Discord webhook

## Logged Information

When the bot joins or leaves a guild, the following information is logged:

- **Server Name**: The name of the guild
- **Server ID**: The unique identifier of the guild
- **Server Owner**: The owner's username and ID
- **Member Count**: Total number of members in the guild
- **Bot Guild Count**: Total number of guilds the bot is in

## Webhook Format

The plugin sends embeds to the configured webhook with:

- **Username**: "Join" or "Leave" depending on the event
- **Avatar**: The bot's avatar
- **Embed**: Rich embed with guild information
- **Thumbnail**: Guild icon (if available)

## Localization

The plugin supports multiple languages through locale files:

- English (en-US)
- French (fr-FR)

## Dependencies

- discord.js ^14.19.0
- express ^4.21.2
- strange-sdk (workspace)

## Owner Only

This plugin is marked as owner-only, meaning it can only be configured by bot owners for security reasons.
