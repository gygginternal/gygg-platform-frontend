import React, { useState } from 'react';
import InputField from '../Shared/InputField';
import { AutoComplete } from '../Shared/AutoComplete';

const ContentFilterDemo = () => {
  const [textValue, setTextValue] = useState('');
  const [bioValue, setBioValue] = useState('');
  const [hobbies, setHobbies] = useState([]);

  const hobbiesOptions = [
    'Reading', 'Traveling', 'Cooking', 'Photography', 'Music', 'Sports',
    'Art', 'Dancing', 'Writing', 'Gaming', 'Hiking', 'Swimming'
  ];

  const handleTextChange = (name, value, meta) => {
    setTextValue(value);
    console.log('Content validation:', meta);
  };

  const handleBioChange = (name, value, meta) => {
    setBioValue(value);
    console.log('Bio validation:', meta);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Content Filter Demo</h2>
      <p>Try typing inappropriate content to see the filtering in action.</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <InputField
          label="Service Title"
          name="title"
          type="text"
          value={textValue}
          onChange={handleTextChange}
          placeholder="Describe your service..."
          labelColor="#333"
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <InputField
          label="Bio/Description"
          name="bio"
          type="textarea"
          value={bioValue}
          onChange={handleBioChange}
          placeholder="Tell us about yourself..."
          rows={4}
          labelColor="#333"
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <AutoComplete
          label="Your Hobbies"
          options={hobbiesOptions}
          values={hobbies}
          onChange={setHobbies}
          placeholder="Add your hobbies..."
          labelColor="#333"
        />
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Current Values:</h3>
        <p><strong>Title:</strong> {textValue}</p>
        <p><strong>Bio:</strong> {bioValue}</p>
        <p><strong>Hobbies:</strong> {hobbies.join(', ')}</p>
      </div>
    </div>
  );
};

export default ContentFilterDemo;