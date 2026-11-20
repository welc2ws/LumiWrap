# 🎁 Lumiwrap

Your year in Lumiverse, wrapped. Lumiwrap is a Spotify Wrapped-style recap of your roleplay, Christmas and New Year themed. One of three ghostly hosts reads it to you, or any character from your library can.

You choose what gets scanned, and you see the token cost before anything is sent.

## Features

- **Three scan levels**
  - *Stats*: counts everything on your machine (messages, words, top characters, longest chat, busiest month and hour, night-owl %, streaks, rerolls, personas, top words, RP personality). **0 tokens** with the built-in host lines.
  - *Highlights + stats*: adds a small sample from your top chats so the host can quote you. One small call.
  - *Deep + everything*: adds a summary of each picked chat. Summaries are cached, so re-reading an unchanged chat is free.
- **You pick what's read.** Lumiwrap ranks characters by how many chats they had, then picks each one's longest chats. Every picked chat shows its own token cost and can be unticked.
- **One big Wrapped or one character.** Wrap everything, or a single character's year.
- **Hosts**
  - 🎄 **Holly** (Christmas Past): tinsel, fairy lights, *IT'S CHRISTMAS!!!*, never judges.
  - 😒 **Noelle** (Christmas Present): judges everything, is secretly into it.
  - 👻 **Vesper** (Christmas Future): ominous facts, secretly not nonchalant.
  - 🎁 **Any character** from your library, with an add-on prompt that keeps them in character.
  - Each girl has an editable name, personality prompt, placeholder emoji, sprite image URL and accent color.
- **Editable slides.** Turn slides on or off, reorder them, retitle them and rewrite each slide's prompt.
- **The player.** Full-screen and phone-shaped, with Spotify-style progress bars, tap or arrow keys to move, hold to pause, snow, and a New Year countdown with fireworks at the end. Works on desktop and mobile.
- **Summary card.** Save a 1080×1920 PNG of your year.
- **Expose me.** Pick any chat the Wrapped mentions and the host roasts you for it. It shows the cost first, then adds a bonus slide to the saved Wrapped.
- **Library.** Every Wrapped is saved. Replays are free.
- **Spotify tie-in.** If Spotify Controls is installed, the player shows what's playing. If it isn't, put on your own songs.

## Install

In Lumiverse: **Sidebar → Extensions → install from GitHub**, then paste:

```
https://github.com/welc2ws/lumiwrap
```

The repo has to be public for Lumiverse to download it. Grant the permissions it asks for:

- **generation**: the host's lines and chat summaries
- **characters**, **chats**, **personas**: finding what to count
- **chat_mutation**: Lumiverse needs it for extensions to read chat messages. Lumiwrap never edits your chats.
- **app_manipulation**: the full-screen player. Without it, the player opens in a window instead.

Point **Settings → Connection** at your sidecar or a cheap model to keep costs down.

## Development

```
bun install
bun run build
```

`dist/` is committed so Lumiverse can install straight from the repo. Rebuild before pushing.
