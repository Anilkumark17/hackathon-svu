const LoadingSpinner = ({ fullPage = false, size = 'medium' }) => {
  const sizeMap = {
    small: 30,
    medium: 50,
    large: 70,
  };

  const spinnerSize = sizeMap[size] || 50;

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: '4px solid var(--glass-border)',
    borderTopColor: 'var(--accent-purple)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: fullPage ? '0' : '2rem auto',
  };

  if (fullPage) {
    return (
      <div className="spinner-overlay">
        <div style={spinnerStyle}></div>
      </div>
    );
  }

  return <div style={spinnerStyle}></div>;
};

export default LoadingSpinner;
