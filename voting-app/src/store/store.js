// import { configureStore } from '@reduxjs/toolkit';
// import uiSlice from './ui-slice';
// import voteSlice from './vote-slice';

// const store = configureStore({
//   reducer: {
//     ui: uiSlice.reducer,
//     vote: voteSlice.reducer
//   }
// })

// export default store;

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import uiSlice from './ui-slice';
import voteSlice from './vote-slice';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage


// 1. Combine your existing reducers
const rootReducer = combineReducers({
  ui: uiSlice.reducer,
  vote: voteSlice.reducer
});

// 2. Set up the persist config
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  // Whitelist 'vote' so only voter data is saved on refresh
  whitelist: ['vote'] 
};

// 3. Create the persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configure the store with middleware fix
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;