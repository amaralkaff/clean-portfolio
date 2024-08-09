import React, { useState, useEffect } from 'react';

interface TickerDigitProps {
  countTo: number;
  duration: number; // Duration in milliseconds to reach 100%
}

const TickerDigit: React.FC<TickerDigitProps> = ({ countTo, duration }) => {
  const [currentDigit, setCurrentDigit] = useState(0);

  useEffect(() => {
    if (duration <= 0) {
      setCurrentDigit(countTo);
      return;
    }

    const increment = countTo / (duration / 10); // Calculate increment based on desired duration
    const interval = setInterval(() => {
      setCurrentDigit(prev => {
        const nextValue = Math.min(prev + increment, countTo);
        if (nextValue >= countTo) {
          clearInterval(interval);
        }
        return nextValue;
      });
    }, 10); // Run the interval every 10ms for smooth animation

    return () => clearInterval(interval);
  }, [countTo, duration]);

  return (
    <div className="ticker-digit">
      <span>{Math.round(currentDigit)}%</span>
    </div>
  );
};

export default TickerDigit;
