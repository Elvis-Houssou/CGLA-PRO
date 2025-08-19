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
  // account_status: string | null;
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
  // account_status: "",
  role: "",
  me_temporaire: {},
};
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: any) => {
    const response = await credentials.loginFunc(credentials.data);
    return response;
  }
);
export const fetchMe = createAsyncThunk("auth/fetchMe", async (data: any) => {
  const response = await data.fetchMeFunc();
  return response;
});
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
      state.me = {};
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
      .addCase(login.fulfilled, (state, action) => {
        state.status = "success";
        // console.log(action.payload.data.access_token);
        const payload = action.payload.data;
        state.token = payload.access_token;
        state.token_type = payload.token_type;
        // state.account_status =payload.account_status;
        state.role = payload.role;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message;
        state.titleMessage = "Erreur de connexion";
        state.bodyMessage = "Nom d'utilisateur ou mot de passe incorrect";
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.me = action.payload;
        state.me_temporaire = action.payload;
      })
      ?.addCase(fetchMe.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message;
      });
  },
});

export const { logout, resetStateStatus } = userSlice.actions;
export default userSlice.reducer;
