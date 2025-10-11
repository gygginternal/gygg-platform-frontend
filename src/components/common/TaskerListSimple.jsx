import React from 'react';

const TaskerListSimple = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple Tasker List Test</h1>
      <p>If you can see this, React is working fine.</p>
      <div
        style={{
          background: '#f0f0f0',
          padding: '20px',
          borderRadius: '8px',
          margin: '20px 0',
        }}
      >
        <h3>Test Tasker Card</h3>
        <p>Name: John Doe</p>
        <p>Rate: $25/hr</p>
        <p>Location: New York</p>
        <p>Bio: Professional helper with 5 years experience.</p>
        <button
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Message
        </button>
      </div>
    </div>
  );
};

export default TaskerListSimple;
