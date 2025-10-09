// Token utility functions
export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
};

export const getTokenRemainingTime = (token) => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return null;
  
  const now = new Date();
  const timeLeft = expirationTime.getTime() - now.getTime();
  
  if (timeLeft <= 0) return null;
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, total: timeLeft };
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const formatTimeRemaining = (timeLeft) => {
  if (!timeLeft) return 'Expired';
  
  const { hours, minutes } = timeLeft;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};