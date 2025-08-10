import { configureStore } from '@reduxjs/toolkit';
// import propertyReducer from './features/properties/propertySlice';
import userReducer from './feature/user/UserSlice';
// import FormDataReducer from "./features/properties/FormPropertySlice"

export const store = configureStore({
  reducer: {
    // property: propertyReducer,
    user:userReducer,
    // FormData:FormDataReducer
  }
});


export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
