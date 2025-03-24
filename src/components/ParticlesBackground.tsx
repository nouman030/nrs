'use client';

import { useCallback, useEffect, useState } from 'react';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles';
import { Engine } from 'tsparticles-engine';

const ParticlesBackground = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    try {
      // Cast engine to the correct type from @tsparticles/engine
      const particlesEngine = engine as unknown as import('@tsparticles/engine').Engine;
      await particlesEngine.init();
      await loadFull(particlesEngine);
    } catch (error) {
      console.error('Failed to initialize particles:', error);
    }
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: false,
        background: {
          color: {
            value: 'transparent',
          },
        },
        fpsLimit: 60,
        particles: {
          color: {
            value: '#ffffff',
          },
          links: {
            color: '#ffffff',
            distance: isMobile ? 100 : 150,
            enable: true,
            opacity: 0.1,
            width: 1,
          },
          move: {
            enable: true,
            outModes: {
              default: 'bounce',
            },
            random: false,
            speed: isMobile ? 0.5 : 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: isMobile ? 600 : 800,
            },
            value: isMobile ? 40 : 80,
          },
          opacity: {
            value: 0.1,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.05,
            },
          },
          shape: {
            type: 'circle',
          },
          size: {
            value: { min: 1, max: isMobile ? 2 : 3 },
          },
        },
        detectRetina: true,
        responsive: [
          {
            maxWidth: 768,
            options: {
              particles: {
                number: {
                  value: 40,
                },
              },
            },
          },
        ],
      }}
    />
  );
};

export default ParticlesBackground;