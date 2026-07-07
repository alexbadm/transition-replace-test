import React, { useCallback, useState } from "react";
import "./App.css";
import { TestComponentAlpha } from "./TestComponentAlpha";
import { TestComponentGamma } from "./TestComponentGamma";
import { TestComponentBeta } from "./TestComponentBeta";
import { TransitionContainer } from "./TransitionContainer";

type State = "alpha" | "beta" | "gamma";

function App() {
  const [state, setState] = useState<State>("alpha");

  const switchState = useCallback(() => {
    setState((prev) => {
      switch (prev) {
        case "alpha":
          return "beta";
        case "beta":
          return "gamma";
        case "gamma":
          return "alpha";
        default:
          return "alpha";
      }
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div className="spacer" />
      <section className="App-section">
        Some section content
        <button onClick={switchState}>switch</button>
      </section>
      <div className="spacer" />
      <TransitionContainer hash={state}>
        {state === "alpha" && <TestComponentAlpha />}
        {state === "beta" && <TestComponentBeta />}
        {state === "gamma" && <TestComponentGamma />}
      </TransitionContainer>
      <div className="spacer" />
      <section className="App-section">Another section with text</section>
      <div className="spacer" />
      <section className="App-section">3-d section</section>
    </div>
  );
}

export default App;
