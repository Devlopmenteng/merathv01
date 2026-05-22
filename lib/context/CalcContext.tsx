import React, { createContext, useContext, useReducer, useState } from 'react';

type State = {
  madhab: string;
  total: number;
  funeral: number;
  debts: number;
  will: number;
  heirs: any[];
};

const initialState: State = {
  madhab: 'hanafi',
  total: 0,
  funeral: 0,
  debts: 0,
  will: 0,
  heirs: [],
};

type Action = { type: string; payload: any };

const calcReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_MADHAB':
      return { ...state, madhab: action.payload };
    case 'SET_ESTATE':
      return { ...state, ...action.payload };
    case 'SET_HEIRS':
      return { ...state, heirs: action.payload };
    default:
      return state;
  }
};

type CalcContextType = {
  state: State;
  dispatch: React.Dispatch<Action>;
  caseName: string;
  setCaseName: (name: string) => void;
  caseDate: string;
  setCaseDate: (date: string) => void;
};

const CalcContext = createContext<CalcContextType | undefined>(undefined);

export const CalcProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(calcReducer, initialState);
  const [caseName, setCaseName] = useState('');
  const [caseDate, setCaseDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <CalcContext.Provider value={{ state, dispatch, caseName, setCaseName, caseDate, setCaseDate }}>
      {children}
    </CalcContext.Provider>
  );
};

export const useCalc = () => {
  const context = useContext(CalcContext);
  if (!context) throw new Error('useCalc must be used within a CalcProvider');
  return context;
};
