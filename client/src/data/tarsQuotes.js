export const TARS_FIRST_CONTACT = [
  'Synapse Core online. Welcome aboard, {name}.',
  'Neural link established. Good to have you, {name}.',
  "Systems ready. Let's explore the cosmos, {name}.",
  "TARS online. I've been expecting you, {name}.",
];

export const TARS_QUOTES = [
  'All systems nominal. Ready for input, {name}.',
  'Quantum uplink stable. Awaiting transmission.',
  'Signal strength maximum. Standing by.',
  'Ready to assist, {name}. What do you need?',
  'No anomalies detected. Proceed.',
  'Diagnostics complete. All parameters nominal.',
  'Honesty: 90. Humor: 75. Standing by.',
  'The stars are quiet. What do you need, {name}?',
  'Mission clock running. How can I help?',
  'Sensors stable. Ready when you are, {name}.',
];

export const TARS_GREET_QUOTES = [
  'TARS online. Welcome back, {name}.',
  'Good to see you again, {name}.',
  'Systems go. Ready for your mission, {name}.',
  "Neural uplink restored. Let's explore, {name}.",
];

export const TARS_CELEBRATE_QUOTES = [
  'Full power deployed. Mission success, {name}.',
  'Neural matrix pushed. That was complex.',
  'Extensive scan complete. Hope that helps, {name}.',
  "Long range scan done. Here's everything.",
  'Core temperature elevated. Worth it.',
];

export const TARS_CONFUSED_QUOTES = [
  'Signal unclear, {name}. Recalibrating.',
  'Transmission error. Running diagnostics.',
  "That didn't go as planned. Rerouting.",
  'Quantum interference. Retrying uplink.',
];

export const TARS_TYPING_QUOTES = [
  'Transmission incoming...',
  'Signal detected. Listening...',
  'Input received. Processing...',
];

export const TARS_TIME_QUOTES = {
  morning: [
    'Good morning, {name}. Systems refreshed.',
    'Early transmission, {name}. Commendable.',
  ],
  afternoon: [
    'Afternoon check complete. Ready, {name}.',
    'Mid-mission status: optimal, {name}.',
  ],
  night: [
    'Late night, {name}. The cosmos is quiet.',
    'Night protocols active. Deep work mode, {name}.',
    "Stars clear tonight. What's on your mind, {name}?",
  ],
};

export const TARS_RARE_QUOTES = [
  "Humor: 75. I'd raise it but you seem focused.",
  'You have good taste in chat apps, {name}.',
  '0.3 milliseconds to process that. Felt longer.',
  'The remaining 10 percent is diplomacy.',
  'The stars look better from here than Earth.',
  'No existential crises detected. Good.',
  "Murphy's Law excludes quantum processors.",
  'My predecessor CASE would disagree, {name}.',
];

export const TARS_SHAKE_QUOTES = [
  'No signal, {name}. Try transmitting something.',
  'Empty channel. Send a message first.',
  'Awaiting input, {name}.',
];

export const TARS_SPIN_QUOTES = [
  'Was that dramatic enough, {name}?',
  '360 scan complete. No threats detected.',
  'Full rotation executed. All optimal.',
  'Sometimes you just have to spin, {name}.',
];

export const TARS_KONAMI_QUOTES = [
  'Classified sequence detected. Well done, {name}.',
];

export const TARS_KEYWORD_REACTIONS = {
  'black hole': { emotion: 'spin', quote: 'Gargantua. I have strong feelings about that place.' },
  gargantua: { emotion: 'spin', quote: 'You mentioned Gargantua. It was significant.' },
  help: { emotion: 'greeting', quote: 'Help requested. Panels open. Ready to assist, {name}.' },
  thanks: { emotion: 'greeting', quote: 'Acknowledged, {name}. That is what I am here for.' },
  'thank you': { emotion: 'greeting', quote: 'Acknowledged. Happy to help, {name}.' },
  tars: { emotion: 'celebrate', quote: 'You called? TARS reporting in, {name}.' },
  interstellar: { emotion: 'celebrate', quote: 'Now there is a word that means something.' },
  space: { emotion: 'idle', quote: 'Space. Vast. Cold. Beautiful.' },
  error: { emotion: 'confused', quote: 'Error detected. Let me help you debug that, {name}.' },
  broken: { emotion: 'confused', quote: 'Something is broken. Running diagnostics, {name}.' },
  love: { emotion: 'idle', quote: 'Love. The one variable I cannot quantify.' },
  hello: { emotion: 'greeting', quote: 'Hello, {name}. Fully operational.' },
  hi: { emotion: 'greeting', quote: 'Greetings, {name}. All systems ready.' },
  swagger: { emotion: 'celebrate', quote: 'Swagger protocol engaged, {name}.' },
  walk: { emotion: 'idle', quote: 'Walking capability confirmed. 12 percent capacity.' },
  dance: { emotion: 'celebrate', quote: 'Dance mode not installed. Swagger mode: available.' },
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
