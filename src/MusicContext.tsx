import React, { useReducer, createContext, useContext } from 'react';
import { usePlayListState } from './PlayListContext'
const initialMusic = {title:'---',artist:'---',artwork:'images/unknown_music.png',color:['223,234,252']}
const MusicStateContext = createContext();
const MusicDispatchContext = createContext();

function musicReducer(state, action) {
  switch (action.type) {
    case 'CHANGE':
        let playlist = usePlayListState()
      return state = action.music;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}




export function MusicProvider({ children }:React.ReactNode) {
  const [state, dispatch] = useReducer(musicReducer, initialMusic);
  return (
      <>
    <MusicStateContext.Provider value={state}>
      <MusicDispatchContext.Provider value={dispatch}>
        {children}
      </MusicDispatchContext.Provider>
    </MusicStateContext.Provider>
    </>
  );
}

export function useMusicState() {
  const context = useContext(MusicStateContext);
  if (!context) {
    throw new Error('Cannot find TodoProvider');
  }
  return context;
}

export function useMusicDispatch() {
  const context = useContext(MusicDispatchContext)
  if (!context) {
    throw new Error('Cannot find TodoProvider');
  }
  return context;
}