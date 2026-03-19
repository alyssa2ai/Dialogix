import { createContext, useContext, useState } from 'react';
import { PERSONA_CONFIGS } from '../data/tarsQuotes';

const PersonaContext = createContext();

export const PersonaProvider = ({ children }) => {
  const [persona, setPersona] = useState('synapse');

  return (
    <PersonaContext.Provider
      value={{
        persona,
        setPersona,
        config: PERSONA_CONFIGS[persona],
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersona = () => useContext(PersonaContext);
