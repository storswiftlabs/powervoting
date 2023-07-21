'use client'
import React, { createContext, useContext, useReducer } from "react";

interface State {
  walletConnected: boolean;
  currentAddress: string;
}

type Action =
  | { type: 'walletConnected'; value: boolean }
  | { type: 'currentAddress'; value: string };

const initialState: State = {
  walletConnected: false,
  currentAddress: '',
};

function reducer(state:any, action: any) {
  switch (action.type) {
    case "walletConnected":
      if (action.value) {
        return {
          ...state,
          walletConnected: action.value,
        };
      }
      return {
        ...state,
        walletConnected: action.value,
        currentAddress: "",
      };

    case "currentAddress":
      return {
        ...state,
        currentAddress: action.value,
      };
    default:
      throw new Error();
  }
}

const Context = createContext<[State, React.Dispatch<Action>] | undefined>(
  undefined
);

function useStore(): [State, React.Dispatch<Action>] {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

// @ts-ignore
function StoreProvider({ children }: StoreProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <Context.Provider value={[state, dispatch]}>
      {children}
    </Context.Provider>
  );
}

export { useStore, StoreProvider };
