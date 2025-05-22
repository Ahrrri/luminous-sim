// src/hooks/useECS.ts
import { useContext } from 'react';
import type { World } from '../ecs/core/World';
import { ECSContext } from './ECSProvider';

interface UseECSReturn {
  world: World;
  step: (deltaTime: number) => void;
}

export function useECS(): UseECSReturn {
  const context = useContext(ECSContext);
  if (!context) {
    throw new Error('useECS must be used within an ECSProvider');
  }
  return context;
}