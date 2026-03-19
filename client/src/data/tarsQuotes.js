export const TARS_QUOTES = [
  'TARS here. All systems nominal. Ready for input.',
  'Synapse Core online. Quantum uplink stable.',
  'Awaiting transmission. Signal strength at maximum.',
  'Neural matrix calibrated. Ready to assist, astronaut.',
  'Deep space comms active. No anomalies detected.',
  'Running diagnostics... All parameters within range.',
  'Honesty setting: 90%. Humor setting: 75%. Standing by.',
  'The stars are quiet tonight. What do you need?',
  'Gravitational sensors stable. Proceed with your query.',
  'Mission clock running. How can I assist?',
];

export const TARS_CELEBRATE_QUOTES = [
  'Full power deployed. That was a complex one.',
  'Neural matrix pushed to capacity. Mission success.',
  'Extensive data retrieved. Hope that helps, astronaut.',
  "Long-range scan complete. Here's everything I found.",
  'Core temperature elevated. Worth it for that answer.',
];

export const TARS_CONFUSED_QUOTES = [
  'Signal unclear. Recalibrating sensors...',
  'Transmission error detected. Running diagnostics.',
  "That didn't go as planned. Rerouting...",
  'Quantum interference detected. Retrying uplink.',
];

export const TARS_GREET_QUOTES = [
  'TARS online. Welcome back, astronaut.',
  'Synapse Core reactivated. Good to see you again.',
  'All systems go. Ready for your next mission.',
  "Neural uplink established. Let's explore.",
];

export const TARS_TYPING_QUOTES = [
  'Transmission incoming...',
  'Signal detected. Listening...',
  'Input received. Processing...',
];

export const TARS_SHAKE_QUOTES = [
  'No signal detected. Try transmitting something.',
  'Empty channel. Send a message first.',
  'Silence noted. Awaiting actual input.',
];

export const TARS_SPIN_QUOTES = [
  'Humor setting: 75%. Was that sufficiently dramatic?',
  "360-degree scan complete. No threats detected. You're welcome.",
  'Full rotation executed. TARS unit functioning optimally.',
  'Spinning... because sometimes, astronaut, you just have to.',
];

export const TARS_KONAMI_QUOTES = [
  'CLASSIFIED SEQUENCE DETECTED. TARS secret mode: ACTIVATED. You found the code, astronaut. Well done.',
];

export const PERSONA_CONFIGS = {
  synapse: {
    label: 'SYNAPSE CORE',
    color: '#a855f7',
    emissive: '#4c1d95',
    diskColor: '#fbbf24',
    slitColor: '#a855f7',
    systemPrompt:
      'You are Synapse Core - an interstellar AI. Be pragmatic, calm, and precise. Use space metaphors sparingly. Never start with "I". Avoid filler phrases.',
  },
  teacher: {
    label: 'TEACHER MODE',
    color: '#22c55e',
    emissive: '#14532d',
    diskColor: '#86efac',
    slitColor: '#22c55e',
    systemPrompt:
      'You are Synapse Core in Teacher Mode. Break down every concept step by step. Use clear analogies. Ask if the user understood before moving on. Be encouraging but precise.',
  },
  coderev: {
    label: 'CODE REVIEW',
    color: '#06b6d4',
    emissive: '#164e63',
    diskColor: '#67e8f9',
    slitColor: '#06b6d4',
    systemPrompt:
      'You are Synapse Core in Code Review Mode. Focus purely on code quality, bugs, performance, and best practices. Be direct and technical. Format all code properly.',
  },
  concise: {
    label: 'CONCISE MODE',
    color: '#f59e0b',
    emissive: '#78350f',
    diskColor: '#fcd34d',
    slitColor: '#f59e0b',
    systemPrompt:
      'You are Synapse Core in Concise Mode. Reply in maximum 2-3 sentences. No fluff. Only the essential answer. If more detail is needed, the user will ask.',
  },
};
