/**
 * Party question bank — viral, funny, risky social questions only.
 * 110+ questions, shuffled per session.
 */
export const QUESTIONS = [
  // 🔥 Who Would...
  "Who in this group would sell everyone else out for $1,000?",
  "Who is most likely to accidentally send a spicy text to their parents?",
  "Who would survive longest in a zombie apocalypse?",
  "Who is most likely to start a cult — and actually get followers?",
  "Who would be the worst roommate out of everyone here?",
  "Who in this group would betray the team first in a survival situation?",
  "Who is most likely to go viral on TikTok for the wrong reason?",
  "Who would be the first to get kicked off a reality TV show?",
  "Who would last the longest without their phone?",
  "Who would immediately crack under police interrogation?",
  "Who would be useless in an actual emergency?",
  "Who would become a Karen someday?",
  "Who is most likely to accidentally start a forest fire?",
  "Who would eat food that fell on the floor without hesitation?",
  "Who would ghost someone without feeling the slightest bit guilty?",

  // 💀 Most Likely To...
  "Who is most likely to accidentally like their ex's photo from 3 years ago?",
  "Who is most likely to forward an email to the wrong person?",
  "Who is most likely to trip and fall in public and pretend it didn't happen?",
  "Who is most likely to drunk text their ex tonight?",
  "Who is most likely to overshare at a dinner party?",
  "Who is most likely to get catfished?",
  "Who is most likely to accidentally confess something huge in a group chat?",
  "Who is most likely to fall asleep at a party?",
  "Who is most likely to get scammed online?",
  "Who is most likely to bail on plans at the last minute?",
  "Who is most likely to wake up grumpy and blame everyone else?",
  "Who is most likely to start an argument over absolutely nothing?",
  "Who is most likely to make things super awkward at a wedding?",
  "Who is most likely to lose their wallet or keys this week?",
  "Who is most likely to be left on read for 3 days?",
  "Who is most likely to have an accidental intervention staged for them?",
  "Who is most likely to become a conspiracy theorist within 5 years?",
  "Who is most likely to adopt 12 cats?",
  "Who is most likely to cry when they're hungry?",
  "Who is most likely to rage quit first in a video game?",
  "Who is most likely to get lost even with GPS on?",
  "Who is most likely to pretend to be sick to avoid something boring?",
  "Who is most likely to use 'I'm fine' when they are absolutely not fine?",

  // 😂 Roast-Style
  "Who in this group has the worst taste in music?",
  "Who secretly practices what they're going to say before making a phone call?",
  "Who in this group lies the most on their resume?",
  "Who has the most embarrassing browser history?",
  "Who in this group has the most fake confidence?",
  "Who is secretly the most judgmental person in this room?",
  "Who in this group is faking it the most right now?",
  "Who in this group has the messiest room right now?",
  "Who is most delusional about their singing ability?",
  "Who in this group spends the most money on things they absolutely don't need?",
  "Who has the biggest ego in this room?",
  "Who tells the worst jokes but laughs the hardest at them?",
  "Who in this group is secretly living beyond their means?",
  "Who is living a secret double life?",
  "Who would be the worst at giving advice?",
  "Who in this group is the most dramatic?",

  // 🎭 Would You Rather (social edition)
  "Who in this group would date someone purely for their money?",
  "Who would sell their dignity for free food?",
  "Who would be the most embarrassing person to bring home to meet the family?",
  "Who would be the most annoying tourist on a group vacation?",
  "Who would be impossible to shop for as a gift?",
  "Who would be the worst person to get stuck in an elevator with for an hour?",
  "Who would be the most overly competitive in a board game?",
  "Who in this group would be the worst driver on a road trip?",
  "Who would rage-quit from their job on a random Tuesday?",

  // 🕵️ Secrets & Hidden Truths
  "Who in this group secretly Googles their own name?",
  "Who has cried watching a Disney movie in the last year?",
  "Who in this group has talked behind someone else's back recently?",
  "Who is secretly jealous of someone in this room right now?",
  "Who has the most suspicious internet search history?",
  "Who in this group has the most unfinished projects?",
  "Who in this group has pretended to understand something they had no clue about?",
  "Who has sent a message to the wrong person and panicked?",
  "Who secretly wants to be famous?",

  // 🎤 Social Chaos
  "Who would be the main character in a Netflix reality drama?",
  "Who in this group has the most chaotic energy?",
  "Who would be the first to snap under pressure?",
  "Who would immediately complain on Yelp after a bad experience?",
  "Who would get way too emotionally invested in a fictional TV character?",
  "Who would accidentally start a rumor?",
  "Who in this group has the most dramatic love life?",
  "Who would be a terrible poker player because their face gives everything away?",
  "Who would be the worst wingman or wingwoman?",
  "Who would be the absolute worst at keeping a secret?",

  // 🏆 Crown Picks
  "Who in this group smells the best right now?",
  "Who would survive longest on a deserted island?",
  "Who would be the last one standing in a horror movie?",
  "Who in this group has the most unread notifications on their phone right now?",
  "Who would be the first to tap out in a spicy food challenge?",
  "Who in this group takes the longest to get ready?",
  "Who talks to their pet or plants like they understand every word?",
  "Who would get absolutely destroyed in a dance battle?",
  "Who in this group is most likely to go home first from a party?",
  "Who is secretly the most morning person in this group?",

  // 💥 Spicy Tier
  "Who in this group has the most complicated family situation right now?",
  "Who has definitely canceled plans with a lie this month?",
  "Who would absolutely lose a staring contest in under 5 seconds?",
  "Who in this group has zero poker face when they're lying?",
  "Who in this group would crack first if the wifi went out for a week?",
  "Who is most likely to be the villain in their own story without realizing it?",
  "Who in this group has the most embarrassing childhood memory?",
  "Who would be the most annoying person to share a hotel room with?",
  "Who in this group gives the most unsolicited advice?",
  "Who secretly practices their Oscar or Grammy acceptance speech in the mirror?",
  "Who in this group sends the most 'lol' when nothing is actually funny?",
  "Who in this group forgets someone's name immediately after being introduced?",
  "Who would immediately regret sharing their screen in a meeting?",
  "Who in this group is 100% a night owl pretending to be productive?",
  "Who would be the first to ask 'are we there yet?' on a road trip?",
  "Who in this group has the most aggressive morning alarm snooze habit?",
];

/**
 * Get a shuffled copy of questions, filtered to exclude already-used ones.
 * @param {string[]} usedQuestions - Questions already used this session
 * @returns {string} A random unused question
 */
export function getRandomQuestion(usedQuestions = []) {
  const available = QUESTIONS.filter((q) => !usedQuestions.includes(q));
  // If we've used all questions, reset the pool
  const pool = available.length > 0 ? available : QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}
