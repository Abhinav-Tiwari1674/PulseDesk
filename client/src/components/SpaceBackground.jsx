import { useEffect, useRef } from 'react';

const SpaceBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Check prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let animationFrameId;
        let stars = [];
        let dustParticles = [];
        
        // Mouse parallax tracking
        const mouse = { x: 0, y: 0 };
        const targetMouse = { x: 0, y: 0 };

        const STAR_COUNT = 450; // Increased count for dense interstellar clusters
        const DUST_COUNT = 15;

        const colors = {
            white: 'rgba(255, 255, 255, ',
            cyan: 'rgba(6, 182, 212, ',     // Cyan (#06B6D4)
            blue: 'rgba(124, 200, 255, ',   // Blue Highlights (#7CC8FF)
            violet: 'rgba(139, 92, 246, '   // Violet (#8B5CF6)
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initEnvironment();
        };

        const initEnvironment = () => {
            const w = canvas.width;
            const h = canvas.height;
            stars = [];
            dustParticles = [];

            // Define organic galaxy constellation clusters (centroids)
            const clusterCentroids = [
                { x: w * 0.25, y: h * 0.25 },
                { x: w * 0.75, y: h * 0.35 },
                { x: w * 0.5,  y: h * 0.7 },
                { x: w * 0.15, y: h * 0.75 }
            ];

            // 1. Initialize Stars (Clustered & Parallax Layered)
            for (let i = 0; i < STAR_COUNT; i++) {
                let x, y;

                // 75% of stars reside in organic clusters, 25% are uniformly scattered
                if (Math.random() < 0.75) {
                    const centroid = clusterCentroids[Math.floor(Math.random() * clusterCentroids.length)];
                    const angle = Math.random() * Math.PI * 2;
                    // Exponential decay for density centering
                    const distance = Math.pow(Math.random(), 2.5) * Math.min(w, h) * 0.35;
                    x = centroid.x + Math.cos(angle) * distance;
                    y = centroid.y + Math.sin(angle) * distance;
                } else {
                    x = Math.random() * w;
                    y = Math.random() * h;
                }

                // Assign to one of three parallax layers:
                // Layer 0 (Far): Tiny, dim, slow
                // Layer 1 (Mid): Medium, normal
                // Layer 2 (Near): Larger, glowing, faster
                const randDepth = Math.random();
                let layer, size, baseAlpha, parallaxFactor, colorKey;

                if (randDepth < 0.65) {
                    layer = 0; // Far
                    size = Math.random() * 0.5 + 0.3; // 0.3px - 0.8px
                    baseAlpha = Math.random() * 0.3 + 0.1;
                    parallaxFactor = 8; 
                    colorKey = 'white';
                } else if (randDepth < 0.93) {
                    layer = 1; // Mid
                    size = Math.random() * 0.8 + 0.6; // 0.6px - 1.4px
                    baseAlpha = Math.random() * 0.5 + 0.4;
                    parallaxFactor = 22;
                    colorKey = Math.random() < 0.15 ? 'blue' : 'white';
                } else {
                    layer = 2; // Near
                    size = Math.random() * 1.3 + 1.2; // 1.2px - 2.5px
                    baseAlpha = Math.random() * 0.3 + 0.7; // Bright
                    parallaxFactor = 48;
                    colorKey = Math.random() < 0.2 ? 'cyan' : (Math.random() < 0.2 ? 'violet' : 'white');
                }

                // Increased speed for visible, elegant cinematic drift
                let vx, vy;
                if (layer === 0) {
                    vx = (Math.random() * 0.08 + 0.04) * -1; // visible slow drift
                    vy = (Math.random() * 0.04 + 0.02) * -1;
                } else if (layer === 1) {
                    vx = (Math.random() * 0.25 + 0.15) * -1;
                    vy = (Math.random() * 0.12 + 0.06) * -1;
                } else {
                    vx = (Math.random() * 0.6 + 0.4) * -1; // visible near star speed
                    vy = (Math.random() * 0.3 + 0.15) * -1;
                }

                stars.push({
                    x,
                    y,
                    size,
                    baseAlpha,
                    parallaxFactor,
                    colorBase: colors[colorKey],
                    layer,
                    vx,
                    vy,
                    twinkleSpeed: Math.random() * 0.0018 + 0.0006, // slow twinkling intervals (2s to 6s)
                    twinklePhase: Math.random() * Math.PI * 2
                });
            }

            // 2. Initialize Drifting Cosmic Dust Particles
            for (let i = 0; i < DUST_COUNT; i++) {
                dustParticles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: Math.random() * 25 + 15, // Large, diffuse particles
                    alpha: Math.random() * 0.02 + 0.005, // Extremely faint
                    vx: (Math.random() * 0.015 + 0.005) * (Math.random() < 0.5 ? 1 : -1), // very slow horizontal drift
                    vy: (Math.random() * 0.015 + 0.005) * (Math.random() < 0.5 ? 1 : -1), // very slow vertical drift
                    color: Math.random() < 0.6 ? colors.violet : colors.cyan
                });
            }
        };

        // Mouse move listener for parallax offsets
        const handleMouseMove = (e) => {
            // Center mouse offsets from -1.0 to 1.0
            targetMouse.x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            targetMouse.y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        
        resizeCanvas();

        // Animation loop
        const animate = () => {
            const w = canvas.width;
            const h = canvas.height;

            // Clear frame
            ctx.clearRect(0, 0, w, h);

            // Interpolate mouse coordinates (lerp) for silky smooth inertia
            mouse.x += (targetMouse.x - mouse.x) * 0.06;
            mouse.y += (targetMouse.y - mouse.y) * 0.06;

            // 1. Draw Volumetric Cosmic Dust (blurry and glowing)
            ctx.filter = 'blur(15px)'; // Hardware-accelerated canvas filter
            for (let i = 0; i < dustParticles.length; i++) {
                const p = dustParticles[i];

                p.x += p.vx;
                p.y += p.vy;

                // Wrap boundaries
                if (p.x < -p.size) p.x = w + p.size;
                if (p.x > w + p.size) p.x = -p.size;
                if (p.y < -p.size) p.y = h + p.size;
                if (p.y > h + p.size) p.y = -p.size;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.alpha + ')';
                ctx.fill();
            }
            ctx.filter = 'none'; // Reset filter for clean, crisp stars

            // 2. Draw Stars with Parallax displacement & slow drift
            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];

                // Constant slow cosmic drift
                star.x += star.vx;
                star.y += star.vy;

                // Wrap base coordinates at screen boundaries
                if (star.x < 0) star.x += w;
                if (star.x > w) star.x -= w;
                if (star.y < 0) star.y += h;
                if (star.y > h) star.y -= h;

                // Calculate displacement based on layer depth
                const dispX = mouse.x * star.parallaxFactor;
                const dispY = mouse.y * star.parallaxFactor;

                let drawX = star.x + dispX;
                let drawY = star.y + dispY;

                // Adjust drawing coordinates to prevent edge clipping
                if (drawX < 0) drawX += w;
                if (drawX > w) drawX -= w;
                if (drawY < 0) drawY += h;
                if (drawY > h) drawY -= h;

                // Twinkle cycle
                star.twinklePhase += star.twinkleSpeed;
                const twinkleAlpha = star.baseAlpha * (0.25 + 0.75 * Math.abs(Math.sin(star.twinklePhase)));

                ctx.beginPath();
                ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);

                // Add bloom glow for Near layer stars
                if (star.layer === 2) {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = star.colorBase + '0.5)';
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fillStyle = star.colorBase + twinkleAlpha + ')';
                ctx.fill();
            }
            // Reset shadows
            ctx.shadowBlur = 0;

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Multilayered radial gradients serving as cinematic nebulae
    const nebulaStyles = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        backgroundColor: '#090B12', // Dark Space background color
        backgroundImage: `
            radial-gradient(circle at 75% 25%, rgba(6, 182, 212, 0.09) 0%, transparent 55%),
            radial-gradient(circle at 15% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.03) 0%, transparent 65%)
        `,
        transition: 'background 0.5s ease'
    };

    return (
        <div style={nebulaStyles}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default SpaceBackground;
