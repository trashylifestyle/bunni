# 🐰 Bunnieland Bot

Discord bot configured around the Bunnieland-style panel from the reference image.

## Included

- `/setup panel` slash command
- Pink/black Bunnieland panel
- **Get Script** button
- **Reset HWID** button
- Optional staff-role whitelist
- `avatar.jpg` included for the bot profile picture

## Setup

1. Create a Discord application/bot in the Discord Developer Portal.
2. Upload `avatar.jpg` as the bot's profile picture.
3. Copy `.env.example` to `.env`.
4. Fill in:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID`
   - optionally `STAFF_ROLE_ID`
5. Run:

```bash
npm install
npm start
```

6. Invite the bot to your server with the `bot` and `applications.commands` scopes.
7. In your server, run:

```text
/setup panel
```

## Important

The script text is intentionally a placeholder. Replace `SCRIPT_PLACEHOLDER` with whatever legitimate content your server is meant to distribute. The bot does not contain exploit/cheat code or an automatic HWID bypass/reset system.
