import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

import App from "./App";
import UserAndAIContextProvider from "./context/UserAndAI/UserAndAIContext";

import ProcessContextProvider from "./context/Process/ProcessContext";
import ThemeContextProvider from "./context/Theme/ThemeContext";
import { ToastNotification } from "./components/includes/ToastNotification";
import { ToastContainer } from "react-toastify";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <UserAndAIContextProvider>
    <ProcessContextProvider>
      <ThemeContextProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover={false}
          theme="light"
        />
        <ToastNotification />
      </ThemeContextProvider>
    </ProcessContextProvider>
  </UserAndAIContextProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
