// src/hooks/ECSProvider.tsx
import React, { createContext, useEffect, useRef, useState } from 'react';
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
  const [world, setWorld] = useState<World | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // World 초기화
  useEffect(() => {
    const newWorld = new World();
    
    // 시스템들 등록
    newWorld.addSystem(new TimeSystem());
    newWorld.addSystem(new StateSystem());
    newWorld.addSystem(new SkillSystem());
    newWorld.addSystem(new BuffSystem());
    newWorld.addSystem(new DamageSystem());
    newWorld.addSystem(new GaugeSystem());
    
    setWorld(newWorld);

    return () => {
      newWorld.clear();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 게임 루프
  useEffect(() => {
    if (!world) return;

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // 30ms (33.33 FPS)마다 업데이트
      if (deltaTime >= 30) {
        world.update(30); // 고정 타임스텝
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [world]);

  // world가 아직 초기화되지 않았으면 로딩 표시
  if (!world) {
    return <div>ECS 시스템 초기화 중...</div>;
  }

  return (
    <ECSContext.Provider value={world}>
      {children}
    </ECSContext.Provider>
  );
};