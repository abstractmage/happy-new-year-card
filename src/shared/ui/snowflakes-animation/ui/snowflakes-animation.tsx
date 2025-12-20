import { memo, useEffect, useState } from 'react';
import type { IOptions, RecursivePartial } from '@tsparticles/engine';
import { loadSnowPreset } from '@tsparticles/preset-snow';
import Particles, { initParticlesEngine } from '@tsparticles/react';

const particlesOptions: RecursivePartial<IOptions> = {
  preset: "snow",
  background: {
    opacity: 0,
  },
  particles: {
    number: {
      value: 100,
    },
    move: {
      speed: 2,
    },
    size: {
      value: { min: 1, max: 5 },
    },
  },
  fullScreen: { enable: false },
};

export const SnowflakesAnimation = memo(function SnowflakesAnimation() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSnowPreset(engine);
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) return;

  return (
    <Particles
      id="tsparticles"
      className="absolute left-0 top-0 w-full h-full"
      options={particlesOptions}
    />
  );
});
