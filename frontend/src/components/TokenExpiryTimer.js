import React, { useState, useEffect } from 'react';
import { Chip } from '@mui/material';
import { AccessTime, Warning } from '@mui/icons-material';
import { getTokenRemainingTime, formatTimeRemaining } from '../utils/tokenUtils';

const TokenExpiryTimer = () => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const token = localStorage.getItem('token');
      const remaining = getTokenRemainingTime(token);
      
      setTimeLeft(remaining);
      
      // Show warning if less than 30 minutes remaining
      if (remaining && remaining.total < 30 * 60 * 1000) {
        setIsWarning(true);
      } else {
        setIsWarning(false);
      }
    };

    // Update immediately
    updateTimer();
    
    // Update every minute
    const interval = setInterval(updateTimer, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) {
    return (
      <Chip
        icon={<Warning />}
        label="Session Expired"
        size="small"
        color="error"
        variant="outlined"
        sx={{ 
          color: 'white', 
          borderColor: '#f44336',
          '& .MuiChip-icon': { color: '#f44336' }
        }}
      />
    );
  }

  return (
    <Chip
      icon={<AccessTime />}
      label={`Session: ${formatTimeRemaining(timeLeft)}`}
      size="small"
      variant="outlined"
      color={isWarning ? 'warning' : 'default'}
      sx={{ 
        color: isWarning ? '#ff9800' : 'white', 
        borderColor: isWarning ? '#ff9800' : 'rgba(255,255,255,0.3)',
        '& .MuiChip-icon': { 
          color: isWarning ? '#ff9800' : 'rgba(255,255,255,0.7)' 
        }
      }}
    />
  );
};

export default TokenExpiryTimer;