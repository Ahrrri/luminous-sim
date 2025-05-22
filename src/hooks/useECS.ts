// src/hooks/useECS.ts
import { useContext } from 'react';
import { World } from '../ecs/core/World';
import { ECSContext } from './ECSProvider'; // ECSProvider에서 import

export function useECS(): World {
  const world = useContext(ECSContext);
  if (!world) {
    throw new Error('useECS must be used within an ECSProvider');
  }
  return world;
}