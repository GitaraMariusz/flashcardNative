import React, { createContext, useContext } from 'react';

const FirebaseContext = createContext(null);

export const useFirebase = () => {
  return useContext(FirebaseContext);
};

export const FirebaseProvider = FirebaseContext.Provider;