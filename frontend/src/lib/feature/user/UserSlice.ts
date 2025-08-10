import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Me } from "@/props/index";




export interface UserInitialState {
  me: Me | any;
  status: string;
  error: any;
  titleMessage: string;
  bodyMessage: string;
  token: string | null;
  payload: any;
  token_type: string | null;
  account_status: string | null;
  role: string;
  me_temporaire?: Me | any;
}

const initialState: UserInitialState = {
  me: {},
  status: "idle",
  error: null,
  titleMessage: "",
  bodyMessage: "",
  token: null,
  payload: {},
  token_type: null,
  account_status: "",
  role: "",
  me_temporaire: {},
};
export const login = createAsyncThunk(

    
    
)
export const fetchMe = createAsyncThunk(
    
)
// Slice utilisateur
export const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      // Supprimer les tokens du localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");

      // Réinitialiser l'état
    //   state.me = {};
      state.status = "idle";
      state.error = null;
      state.token = null;
    },
    resetStateStatus: (state) => {
      setTimeout(() => {}, 5000);
      state.status = "idle";
      state.titleMessage = "";
      state.bodyMessage = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder




  },
});

export const { logout, resetStateStatus } = userSlice.actions;
export default userSlice.reducer;
