import React, { useState } from 'react';
import './GreetingCounter.css';

// Functional component: Receives props via destructuring
const GreetingCounter = ({ initialName = 'Anonymous User' }) => {
  // State with useState hook: [currentValue, setterFunction] = useState(initial);
  const [name, setName] = useState(initialName); // Editable name from props
  const [count, setCount] = useState(0); // Counter starts at 0
  const [todos, setTodos] = useState(['Learn Props', 'Master State', 'Practice Hooks']); // Initial todo array
  const [newTodo, setNewTodo] = useState(''); // Input for new todo

  // Event handlers:
  const handleNameChange = (e) => {
    const inputValue = e.target.value.trim(); // Trim removes extra spaces
    // Basic validation: Default if empty
    setName(inputValue || 'Anonymous User');
  };

  const increment = () => {
    setCount(count + 1); // Increments counter
  };

  const decrement = () => {
    setCount(count - 1); // Decrements (allows negatives)
  };

  // From Instruction 4: Reset function for workflow practice
  const resetCounter = () => {
    setCount(0); // Resets to 0 without affecting other state
  };

  const addTodo = () => {
    const trimmedTodo = newTodo.trim();
    if (trimmedTodo) { // Validation: Not empty
      // Immutable update: Spread operator copies array, adds new item
      setTodos([...todos, trimmedTodo]);
      setNewTodo(''); // Clear input
    } else {
      // Error handling: Simple alert (use modals in production)
      alert('Todo cannot be empty! Please enter a task.');
    }
  };

  // JSX: Returns UI. Uses {state} for dynamic content, functions for events.
  return (
    <section className="greeting-counter" aria-label="Greeting, Counter, and Todo Demo">
      {/* Greeting Section: Props + State */}
      <article className="profile-card">
        <h2>Profile Greeting</h2>
        <label htmlFor="nameInput">Enter Your Name:</label>
        <input
          id="nameInput"
          type="text"
          value={name} // Controlled component: Value tied to state
          onChange={handleNameChange} // Event: Updates on every keystroke
          placeholder="Type your name here..."
          aria-required="true" // Accessibility
        />
        <p className="greeting-text">Hello, {name}! Welcome to React. 🎉</p>
      </article>

      {/* Counter Section: State + Events + Reset (Instruction 4) */}
      <article className="counter-section">
        <h2>Counter Value: {count}</h2>
        <div className="button-group">
          <button onClick={decrement} aria-label="Decrease counter">-</button>
          <button onClick={increment} aria-label="Increase counter">+</button>
          {/* Added for Instruction 4: Demonstrates hot reload and state reset */}
          <button onClick={resetCounter} aria-label="Reset counter">Reset</button>
        </div>
      </article>

      {/* Todo Section: Array State + Mapping + Validation */}
      <article className="todos-section">
        <h2>Simple Todo List ({todos.length} items)</h2>
        <div className="todo-input">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)} // Inline handler
            placeholder="Add a new todo..."
          />
          <button onClick={addTodo}>Add Todo</button>
        </div>
        <ul className="todo-list">
          {/* Dynamic rendering: map() over array; key for React optimization */}
          {todos.map((todo, index) => (
            <li key={index} className="todo-item">
              {todo}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
};

export default GreetingCounter;