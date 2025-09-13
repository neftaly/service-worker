import {StrictMode} from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// eslint-disable-next-line import-x/no-unassigned-import
import "./register-sw.ts";

const root = document.querySelector("#root");
if (!root) {
  throw new Error("Failed to find root.");
}

ReactDOM.createRoot(root).render(<StrictMode>
    <App />
  </StrictMode>);
