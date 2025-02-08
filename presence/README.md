# Presence Plugin

A plugin to manage the bot's presence (status, activity type, and message) on Discord.

## Configuration

```json
{
    "STATUS": "online", // Bot's status: online, idle, dnd, invisible
    "TYPE": "WATCHING", // Activity type: PLAYING, LISTENING, WATCHING, COMPETING
    "MESSAGE": "with {servers} servers and {members} members!" // Status message
}
```

### Variables

The status message supports the following variables:

- `{servers}` - Total number of servers the bot is in
- `{members}` - Total number of members across all servers

### Activity Types

- `PLAYING` - "Playing Minecraft"
- `LISTENING` - "Listening to Spotify"
- `WATCHING` - "Watching YouTube"
- `COMPETING` - "Competing in Tournament"

### Status Options

- `online` - Green status
- `idle` - Yellow status
- `dnd` - Red status (Do Not Disturb)
- `invisible` - Appears offline

## Note

This plugin is restricted to bot owners only.
