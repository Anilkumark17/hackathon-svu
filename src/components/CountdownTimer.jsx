import { useState, useEffect } from 'react';
import { Timer, AlertCircle } from 'lucide-react';

const CountdownTimer = ({ endTime, onTimeEnd }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(endTime);
      setTimeLeft(remaining);

      if (remaining.total <= 0 && onTimeEnd) {
        onTimeEnd();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onTimeEnd]);

  function calculateTimeLeft(end) {
    const difference = new Date(end) - new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    };
  }

  const isWarning = timeLeft.total > 0 && timeLeft.total < 6 * 60 * 60 * 1000; // Less than 6 hours
  const isCritical = timeLeft.total > 0 && timeLeft.total < 2 * 60 * 60 * 1000; // Less than 2 hours

  return (
    <div style={styles.container} className={timeLeft.total > 0 ? 'pulse' : ''}>
      <div style={styles.header}>
        <Timer size={28} />
        <h3 style={styles.title}>Time Remaining</h3>
      </div>
      
      {timeLeft.total === 0 ? (
        <div style={styles.endedContainer}>
          <AlertCircle size={50} color="#ff0844" />
          <p style={styles.endedText}>Hackathon Ended</p>
        </div>
      ) : (
        <div style={styles.timeGrid}>
          <TimeUnit value={timeLeft.days} label="Days" isWarning={isWarning} isCritical={isCritical} />
          <TimeUnit value={timeLeft.hours} label="Hours" isWarning={isWarning} isCritical={isCritical} />
          <TimeUnit value={timeLeft.minutes} label="Minutes" isWarning={isWarning} isCritical={isCritical} />
          <TimeUnit value={timeLeft.seconds} label="Seconds" isWarning={isWarning} isCritical={isCritical} />
        </div>
      )}
    </div>
  );
};

const TimeUnit = ({ value, label, isWarning, isCritical }) => {
  const color = isCritical 
    ? '#ff0844' 
    : isWarning 
    ? '#fee140' 
    : 'var(--accent-purple)';

  return (
    <div style={styles.timeUnit}>
      <div style={{...styles.timeValue, color}}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={styles.timeLabel}>{label}</div>
    </div>
  );
};

const styles = {
  container: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
  },
  timeUnit: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: '3rem',
    fontWeight: '700',
    lineHeight: 1,
    marginBottom: '0.5rem',
    fontVariantNumeric: 'tabular-nums',
  },
  timeLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  endedContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '2rem',
  },
  endedText: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#ff0844',
  },
};

export default CountdownTimer;
