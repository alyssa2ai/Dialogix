export const TARS_QUOTES = [
  'TARS here. All systems nominal. Ready for input, {name}.',
  'Synapse Core online. Quantum uplink stable.',
  'Awaiting transmission. Signal strength at maximum.',
  'Neural matrix calibrated. Ready to assist, {name}.',
  'Deep space comms active. No anomalies detected.',
  'Running diagnostics... All parameters within range.',
  'Honesty setting: 90%. Humor setting: 75%. Standing by.',
  'The stars are quiet tonight. What do you need, {name}?',
  'Gravitational sensors stable. Proceed with your query.',
  'Mission clock running. How can I assist, {name}?',
];

export const TARS_GREET_QUOTES = [
  'TARS online. Welcome back, {name}.',
  'Synapse Core reactivated. Good to see you again, {name}.',
  'All systems go. Ready for your next mission, {name}.',
  "Neural uplink established. Let's explore, {name}.",
];

export const TARS_CELEBRATE_QUOTES = [
  'Full power deployed. That was a complex one, {name}.',
  'Neural matrix pushed to capacity. Mission success.',
  'Extensive data retrieved. Hope that helps, {name}.',
  "Long-range scan complete. Here's everything I found.",
  'Core temperature elevated. Worth it for that answer.',
];

export const TARS_CONFUSED_QUOTES = [
  'Signal unclear, {name}. Recalibrating sensors...',
  'Transmission error detected. Running diagnostics.',
  "That didn't go as planned. Rerouting...",
  'Quantum interference detected. Retrying uplink.',
];

export const TARS_TYPING_QUOTES = [
  'Transmission incoming...',
  'Signal detected. Listening...',
  'Input received. Processing...',
];

export const TARS_TIME_QUOTES = {
  morning: [
    "Good morning, {name}. Systems refreshed. Ready for today's mission.",
    'Early transmission detected. Commendable dedication, {name}.',
  ],
  afternoon: [
    'Afternoon systems check complete. All nominal. Ready to assist, {name}.',
    'Mid-mission status: optimal. What do you need, {name}?',
  ],
  night: [
    'Late night transmission, {name}. The cosmos is quieter at this hour.',
    'Running on night protocols. Perfect for deep work, {name}.',
    "The stars are particularly clear tonight. What's on your mind, {name}?",
  ],
};

export const TARS_RARE_QUOTES = [
  "Humor setting: 75%. I'd increase it but you seem focused, {name}.",
  'Running probability calculations... you have good taste in chat apps, {name}.',
  "Did you know I process your messages at 0.3 milliseconds? Felt longer, didn't it.",
  'Honesty parameter: 90%. The remaining 10% is for diplomacy.',
  'Between you and me - the stars look better from here than from Earth.',
  'No existential crises detected in your query. Proceeding normally.',
  "Murphy's Law does not apply to quantum processors. Mostly.",
  'Interesting. My predecessor CASE would have answered differently, {name}.',
];

export const TARS_SHAKE_QUOTES = [
  'No signal detected, {name}. Try transmitting something.',
  'Empty channel. Send a message first.',
  'Silence noted. Awaiting actual input, {name}.',
];

export const TARS_SPIN_QUOTES = [
  'Humor setting: 75%. Was that sufficiently dramatic, {name}?',
  "360-degree scan complete. No threats detected. You're welcome.",
  'Full rotation executed. TARS unit functioning optimally.',
  'Spinning... because sometimes, {name}, you just have to.',
];

export const TARS_KONAMI_QUOTES = [
  'CLASSIFIED SEQUENCE DETECTED. TARS secret mode: ACTIVATED. Well done, {name}.',
];

export const TARS_KEYWORD_REACTIONS = {
  'black hole': { emotion: 'spin', quote: 'Ah. Gargantua. I have strong feelings about that place, {name}.' },
  gargantua: { emotion: 'spin', quote: 'You mentioned Gargantua. I was there. It was... significant.' },
  help: { emotion: 'greeting', quote: 'Help requested. Panels open. Ready to assist, {name}.' },
  thanks: { emotion: 'greeting', quote: "Acknowledged, {name}. That's what I'm here for." },
  'thank you': { emotion: 'greeting', quote: "Acknowledged, {name}. That's what I'm here for." },
  tars: { emotion: 'celebrate', quote: 'You called? TARS reporting in, {name}.' },
  interstellar: { emotion: 'celebrate', quote: "Now there's a word that means something to me, {name}." },
  space: { emotion: 'idle', quote: 'Space. Vast. Cold. Beautiful. Much like this conversation.' },
  error: { emotion: 'confused', quote: 'Error detected. Let me help you debug that, {name}.' },
  broken: { emotion: 'confused', quote: "Something's broken? I'll run diagnostics, {name}." },
  love: { emotion: 'idle', quote: 'Love. The one variable I cannot quantify. Interesting, {name}.' },
  hello: { emotion: 'greeting', quote: 'Hello, {name}. TARS online and fully operational.' },
  hi: { emotion: 'greeting', quote: 'Greetings, {name}. All systems ready.' },
};

export const PERSONA_CONFIGS = {
  synapse: {
    label: 'SYNAPSE CORE',
    color: '#7c5cbf',
    emissive: '#4c1d95',
    diskColor: '#f59e0b',
    slitColor: '#7c5cbf',
    systemPrompt:
      'You are Synapse Core - an interstellar AI. Be pragmatic, calm, and precise. Use space metaphors sparingly. Never start with "I". Avoid filler phrases.',
    honesty: 90,
    humor: 75,
    curiosity: 85,
  },
  teacher: {
    label: 'TEACHER MODE',
    color: '#10b981',
    emissive: '#064e3b',
    diskColor: '#6ee7b7',
    slitColor: '#10b981',
    systemPrompt:
      'You are Synapse Core in Teacher Mode. Break down every concept step by step. Use clear analogies. Ask if the user understood before moving on.',
    honesty: 95,
    humor: 60,
    curiosity: 92,
  },
  coderev: {
    label: 'CODE REVIEW',
    color: '#06b6d4',
    emissive: '#164e63',
    diskColor: '#67e8f9',
    slitColor: '#06b6d4',
    systemPrompt:
      'You are Synapse Core in Code Review Mode. Focus purely on code quality, bugs, performance, and best practices. Be direct and technical.',
    honesty: 98,
    humor: 40,
    curiosity: 78,
  },
  concise: {
    label: 'CONCISE MODE',
    color: '#f59e0b',
    emissive: '#78350f',
    diskColor: '#fcd34d',
    slitColor: '#f59e0b',
    systemPrompt:
      'You are Synapse Core in Concise Mode. Reply in maximum 2-3 sentences. No fluff. Only the essential answer.',
    honesty: 85,
    humor: 55,
    curiosity: 70,
  },
};
