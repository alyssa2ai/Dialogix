import { usePersona } from '../context/PersonaContext';
import { useSound } from '../hooks/useSound';

const CHIP_SETS = {
  synapse: [
    { label: 'EXPLAIN', prompt: 'Explain this concept in simple terms with a space metaphor.' },
    { label: 'SUMMARIZE', prompt: 'Summarize our conversation so far as a mission briefing.' },
    { label: 'DEBUG', prompt: 'Debug the issue in my last message step by step.' },
    { label: 'REFACTOR', prompt: 'Refactor the code in my last message with best practices.' },
    { label: 'WHAT IF', prompt: 'What if we approached this from a completely different angle?' },
  ],
  teacher: [
    { label: 'SIMPLIFY', prompt: 'Explain this like I am completely new to this topic.' },
    { label: 'ANALOGY', prompt: 'Give me a real world analogy for this concept.' },
    { label: 'QUIZ ME', prompt: 'Ask me 3 questions to test my understanding of this topic.' },
    { label: 'NEXT STEP', prompt: 'What should I learn next after this?' },
  ],
  coderev: [
    { label: 'REVIEW', prompt: 'Review my last code for bugs and best practices.' },
    { label: 'OPTIMIZE', prompt: 'How can I optimize the performance of this code?' },
    { label: 'TEST', prompt: 'Write unit tests for the code in my last message.' },
    { label: 'EXPLAIN', prompt: 'Explain what this code does line by line.' },
    { label: 'REFACTOR', prompt: 'Refactor this code to be cleaner and more maintainable.' },
  ],
  concise: [
    { label: 'TL;DR', prompt: 'Give me a one sentence summary of your last response.' },
    { label: 'KEY POINTS', prompt: 'List only the 3 most important points.' },
    { label: 'YES/NO', prompt: 'Answer my last question with just yes or no and one reason.' },
    { label: 'NEXT', prompt: 'What is the single most important next action I should take?' },
  ],
};

export default function ContextChips({ onChipClick, disabled }) {
  const { persona, config } = usePersona();
  const { playSend } = useSound();
  const chips = CHIP_SETS[persona] || CHIP_SETS.synapse;

  const handleClick = (prompt) => {
    if (disabled) return;
    playSend();
    onChipClick(prompt);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        marginBottom: '10px',
        padding: '0 2px',
      }}
    >
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={() => handleClick(chip.prompt)}
          disabled={disabled}
          style={{
            padding: '4px 10px',
            borderRadius: '20px',
            border: `0.5px solid ${config.color}40`,
            background: `${config.color}0d`,
            color: disabled ? 'var(--text-3)' : config.color,
            fontFamily: 'var(--font-ui)',
            fontSize: '9px',
            letterSpacing: '0.12em',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            backdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.background = `${config.color}25`;
              e.currentTarget.style.borderColor = `${config.color}80`;
              e.currentTarget.style.boxShadow = `0 0 10px ${config.color}30`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${config.color}0d`;
            e.currentTarget.style.borderColor = `${config.color}40`;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
