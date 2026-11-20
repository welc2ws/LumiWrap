// Built-in host lines for Stats mode, so a wrap can run with zero tokens.
// Macros come from statVars() in shared.ts.

import type { HostId } from './shared'

type Lines = Record<string, string>

export const BUILTIN_LINES: Record<HostId, Lines> = {
  past: {
    intro: `IT'S CHRISTMAS!!! Okay, okay, it's Lumiwrap, but same energy!! Welcome to your {{year}}, {{user}}! {{chats}} chats, {{characters}} characters. I have my list and I'm checking it twice!`,
    totals: `You sent {{userMessages}} messages and wrote {{words}} words! That's like {{novels}} whole novels!! Somebody get this writer a book deal and a candy cane!`,
    top_characters: `Drumroll please!!! These are the ones you kept coming back to. Every single one of them goes on the nice list. Every one!`,
    number_one: `Your #1 was {{top1}}! {{top1Messages}} messages across {{top1Chats}} chats! That's not a phase, that's a holiday tradition!`,
    longest_chat: `Your longest chat was "{{longestChat}}" with {{longestChatChar}}: {{longestChatMessages}} messages! That's longer than my tinsel and I have a LOT of tinsel!`,
    time: `You were busiest in {{month}}, especially on {{weekday}}s around {{hour}}! And {{nightPct}}% of your messages were after midnight. Naughty list? Nope! Nice-and-sleepy list!`,
    streak: `{{streak}} days in a row!!! And {{activeDays}} days total! You showed up more than Santa does!`,
    rerolls: `You rerolled {{swipes}} times! Your most-rerolled chat was "{{rerollChat}}". Hey, you just know what you want for Christmas!`,
    personas: `This year you were mostly {{persona}}, and {{personaCount}} different people overall! So many outfits! I love a costume change!`,
    words: `Your top words were "{{word1}}", "{{word2}}" and "{{word3}}"! And they kept saying "{{theirWord}}" right back. It's like a duet!`,
    personality: `And your RP personality is... {{archetype}}!!! {{archetypeBlurb}} Straight to the top of the nice list!`,
    outro: `That's your {{year}}!! Thank you for every single message. I can't WAIT to see what you get up to in {{nextYear}}. Merry everything, {{user}}!`,
  },
  present: {
    intro: `Oh. It's you. Fine, here's your {{year}} Lumiwrap, {{user}}. {{chats}} chats, {{characters}} characters. Let's get this over with.`,
    totals: `{{userMessages}} messages. {{words}} words. That's {{novels}} novels, and none of them got published. Wow. Okay.`,
    top_characters: `Your top characters. I'm not gonna say anything. ...I'm saying something later.`,
    number_one: `{{top1}}. {{top1Messages}} messages. {{top1Chats}} chats. That's {{top1Share}}% of everything you sent. Normal behavior. Totally normal.`,
    longest_chat: `"{{longestChat}}" with {{longestChatChar}}. {{longestChatMessages}} messages. I read some of it. I'm not telling you which parts.`,
    time: `Busiest in {{month}}. {{weekday}}s. Around {{hour}}. {{nightPct}}% after midnight. Go to sleep. ...After this.`,
    streak: `{{streak}} days in a row. {{activeDays}} days total. Do you have hobbies? This is the hobby. Got it.`,
    rerolls: `{{swipes}} rerolls. "{{rerollChat}}" got swiped {{rerollChatSwipes}} times. Picky much? ...Same, honestly.`,
    personas: `Mostly {{persona}}. {{personaCount}} personas total. Identity crisis? No judgment. Some judgment.`,
    words: `Your top words: "{{word1}}", "{{word2}}", "{{word3}}". They kept saying "{{theirWord}}". Tells me everything I need to know.`,
    personality: `Your RP personality is {{archetype}}. {{archetypeBlurb}} Yeah. That tracks.`,
    outro: `That's {{year}}. It was... fine. It was good, actually. Don't make it weird. See you in {{nextYear}}, {{user}}.`,
  },
  future: {
    intro: `{{user}}. The ledger for {{year}} is closed. {{chats}} chats. {{characters}} characters. I have read all of it.`,
    totals: `{{userMessages}} messages. {{words}} words. {{novels}} novels' worth. ...Every word is recorded.`,
    top_characters: `These names appear in the ledger more than any others. Some of them... know.`,
    number_one: `{{top1}}. {{top1Messages}} messages. {{top1Chats}} chats. They will remember you. ...Interesting.`,
    longest_chat: `"{{longestChat}}". {{longestChatChar}}. {{longestChatMessages}} messages. It is not over. It is never over.`,
    time: `{{month}}. {{weekday}}. {{hour}}. You were most present then. {{nightPct}}% of your words came in the dark hours. I was there.`,
    streak: `{{streak}} consecutive days. {{activeDays}} in total. The chain was unbroken. ...For a while.`,
    rerolls: `{{swipes}} times you rejected what was given and asked again. "{{rerollChat}}": {{rerollChatSwipes}}. The other timelines remember.`,
    personas: `You wore {{personaCount}} faces. Mostly {{persona}}. Which one is real. ...Do not answer.`,
    words: `"{{word1}}". "{{word2}}". "{{word3}}". And they answered: "{{theirWord}}". Patterns are prophecy.`,
    personality: `Your nature, recorded: {{archetype}}. {{archetypeBlurb}} ...This was always going to be the answer.`,
    outro: `{{year}} ends. {{nextYear}} is already written. I have seen it. ...You'll like it. Goodbye, {{user}}.`,
  },
}
