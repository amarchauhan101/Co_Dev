import { configureStore } from "@reduxjs/toolkit";
import userslice from "../new/authslice"

const store = configureStore({
   reducer:{
    userauth:userslice
   }
})

export default store;