import { useEffect } from "react";
import { Serwist } from "@serwist/window";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
  useEffect(() => {
    const serwist = new Serwist("./sw-classic.js", {
      scope: "/",
      type: "classic",
    });

    // Log update messages
    serwist.addEventListener("message", (event) => {
      if (event.data.meta === "serwist-broadcast-update") {
        console.log(event.data.meta, event.data.type, event.data);
      }
    });

    void serwist.register();
  }, []);
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Serwist</h1>
    </>
  );
}

export default App;
