"use client";

import dynamic from 'next/dynamic';

const CreatureAnimation = dynamic(() => import('./CreatureAnimation'), {
  ssr: false,
});

const CreatureAnimationWrapper: React.FC = () => {
  return <CreatureAnimation readabilityMode={true} />;
};

export default CreatureAnimationWrapper;