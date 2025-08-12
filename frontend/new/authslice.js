import { createSlice } from '@reduxjs/toolkit';

function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload);
  } catch (e) {
    console.error("Invalid JWT:", e);
    return null;
  }
}

const getValidUser = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('user'));
    const token = stored?.token;

    if (!token) return null;

    const decoded = parseJwt(token);
    if (decoded && Date.now() < decoded.exp * 1000) {
      return stored;
    } else {
      localStorage.removeItem('user');
    }
  } catch (err) {
    console.error("User parsing error:", err);
    localStorage.removeItem('user');
  }

  return null;
};

const initialState = {
  user: getValidUser()
};

const userslice = createSlice({
  name: 'userauth',
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem('user');
    },
    updateUser: (state, action) => {
      if (state.user?.userWithToken) {
        state.user.userWithToken = {
          ...state.user.userWithToken,
          ...action.payload,
        };
      }
    },
  }
});

export const { login, logout,updateUser } = userslice.actions;
export default userslice.reducer;
