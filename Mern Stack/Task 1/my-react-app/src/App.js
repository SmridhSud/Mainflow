import React from 'react';
import GreetingCounter from './GreetingCounter';
import './App.css';

function App() {
  // Props example: Data passed to child component (could be from API in full MERN)
  const initialName = 'React Beginner';

  return (
    <div className="App">
      <header className="App-header">
        <h1>MERN Stack Task 1: Basic React Demo</h1>
        <p>Custom component below: Props, State (useState), JSX, Events, Validation, Responsive CSS.</p>
        {/* Renders the custom component with initialName prop */}
        <GreetingCounter initialName={initialName} />
      </header>
    </div>
  );
}

export default App;