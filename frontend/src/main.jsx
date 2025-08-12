import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./glow.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import store from "../store/store.js";
import { Provider } from "react-redux";

import { ToastContainer } from "react-toastify";
import { ProjectProvider } from "../context/ProjectContext.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <StrictMode>
        <AuthProvider>
          <ProjectProvider>
            <App />
            <ToastContainer />
          </ProjectProvider>
        </AuthProvider>
      </StrictMode>
    </BrowserRouter>
  </Provider>
);
