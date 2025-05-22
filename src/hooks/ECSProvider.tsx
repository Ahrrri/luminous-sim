// src/hooks/ECSProvider.tsx
import React, { createContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { World } from '../ecs/core/World';
import { 
  TimeSystem, 
  StateSystem, 
  SkillSystem, 
  BuffSystem, 
  DamageSystem, 
  GaugeSystem 
} from '../ecs/systems';

// ECSContext를 여기서 정의하고 export
export const ECSContext = createContext<World | null>(null);

interface ECSProviderProps {
  children: ReactNode;
}

export const ECSProvider: React.FC<ECSProviderProps> = ({ children }) => {
  const worldRef = useRef<World | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // World 초기화
  useEffect(() => {
    if (!worldRef.current) {
      const world = new World();
      
      // 시스템들 등록
      world.addSystem(new TimeSystem());
      world.addSystem(new StateSystem());
      world.addSystem(new SkillSystem());
      world.addSystem(new BuffSystem());
      world.addSystem(new DamageSystem());
      world.addSystem(new GaugeSystem());
      
      worldRef.current = world;
    }

    return () => {
      if (worldRef.current) {
        worldRef.current.clear();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 게임 루프
  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      if (!worldRef.current) return;

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // 30ms (33.33 FPS)마다 업데이트
      if (deltaTime >= 30) {
        worldRef.current.update(30); // 고정 타임스텝
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <ECSContext.Provider value={worldRef.current}>
      {children}
    </ECSContext.Provider>
  );
};