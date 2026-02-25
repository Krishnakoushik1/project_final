import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CTProvider } from "./context/CTContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CTProvider>
      <App />
    </CTProvider>
  </React.StrictMode>
);