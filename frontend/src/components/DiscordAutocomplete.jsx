import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaSpinner } from 'react-icons/fa';
import { apiUrl } from '../utils/api';
import './DiscordAutocomplete.css';

const DiscordAutocomplete = ({ value, onChange, placeholder = "ID de Discord o nombre de usuario", className = "", disabled = false }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (inputValue) => {
    onChange(inputValue);
    
    if (inputValue.length >= 3) {
      setSearching(true);
      try {
        const response = await fetch(apiUrl(`/api/discord/search-users?q=${encodeURIComponent(inputValue)}`));
        if (response.ok) {
          const users = await response.json();
          setSuggestions(users.slice(0, 10));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error('Error buscando usuarios:', err);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSearching(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectUser = (user) => {
    onChange(user.id);
    setShowSuggestions(false);
  };

  return (
    <div className={`discord-autocomplete-container ${className}`} ref={containerRef}>
      <div className="autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="autocomplete-input"
          disabled={disabled}
        />
        {searching && (
          <div className="autocomplete-spinner">
            <FaSpinner className="fa-spin" />
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="autocomplete-suggestions">
          {suggestions.map((user, index) => (
            <div
              key={user.id || index}
              className="suggestion-item"
              onClick={() => selectUser(user)}
            >
              <div className="suggestion-avatar">
                {user.avatar ? (
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`} 
                    alt={user.username || 'Avatar'} 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="suggestion-avatar-placeholder" style={{ display: user.avatar ? 'none' : 'flex' }}>
                  <FaUser size={16} />
                </div>
              </div>
              <div className="suggestion-info">
                <div className="suggestion-name">
                  {user.displayName || user.username || `Usuario ${user.id}`}
                </div>
                <div className="suggestion-id">ID: {user.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscordAutocomplete;

