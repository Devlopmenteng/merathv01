import React, { createContext, useContext, useReducer } from 'react';
import type { HeirEntry } from '../engine/types';

type State = {
  madhab: string;
  total: number;
  funeral: number;
  debts: number;
  will: number;
  heirs: HeirEntry[];
  caseName: string;
  caseDate: string;
};

const initialState: State = {
  madhab: 'hanafi',
  total: 0,
  funeral: 0,
  debts: 0,
  will: 0,
  heirs: [],
  caseName: '',
  caseDate: new Date().toISOString().split('T')[0],
};

type CalcPayload = Partial<
  Pick<State, 'madhab' | 'total' | 'funeral' | 'debts' | 'will' | 'heirs'>
>;

type Action =
  | { type: 'SET_MADHAB'; payload: string }
  | { type: 'SET_ESTATE'; payload: CalcPayload }
  | { type: 'SET_HEIRS'; payload: HeirEntry[] }
  | { type: 'SET_CASE'; payload: { caseName: string; caseDate: string } };

const calcReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_MADHAB':
      return { ...state, madhab: action.payload };
    case 'SET_ESTATE':
      return { ...state, ...action.payload };
    case 'SET_HEIRS':
      return { ...state, heirs: action.payload };
    case 'SET_CASE':
      return { ...state, caseName: action.payload.caseName, caseDate: action.payload.caseDate };
    default:
      return state;
  }
};

type CalcContextType = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

const CalcContext = createContext<CalcContextType | undefined>(undefined);

export const CalcProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(calcReducer, initialState);

  const value = React.useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <CalcContext.Provider value={value}>{children}</CalcContext.Provider>;
};

export const useCalc = () => {
  const context = useContext(CalcContext);
  if (!context) throw new Error('useCalc must be used within a CalcProvider');
  return context;
};
