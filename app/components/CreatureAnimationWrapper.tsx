"use client";

import dynamic from 'next/dynamic';

const CreatureAnimation = dynamic(() => import('./CreatureAnimation'), {
  ssr: false,
});

const CreatureAnimationWrapper: React.FC = () => {
  return <CreatureAnimation />;
};

export default CreatureAnimationWrapper;