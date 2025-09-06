const NoiseFilter = () => {
  return (
    <svg
      style={{
        position: 'fixed',
        width: 0,
        height: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id="grainyFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            seed="5"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
    </svg>
  );
};

export default NoiseFilter;