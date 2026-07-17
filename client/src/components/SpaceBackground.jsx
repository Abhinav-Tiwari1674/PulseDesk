import React from 'react';

const SpaceBackground = () => {
    // Clean, modern dark mode background style inspired by premium SaaS applications (e.g. Linear)
    const backgroundStyles = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        backgroundColor: '#09090b', // Dark zinc mode
        backgroundImage: `
            radial-gradient(circle at 50% -20%, rgba(6, 182, 212, 0.05) 0%, transparent 70%),
            radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.02) 0%, transparent 50%)
        `
    };

    return <div style={backgroundStyles} />;
};

export default SpaceBackground;
