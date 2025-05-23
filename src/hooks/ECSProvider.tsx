// src/hooks/ECSProvider.tsx
import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { World } from '../ecs/core/World';
import { 
  TimeSystem, 
  StateSystem, 
  SkillSystem, 
  BuffSystem, 
  DamageSystem, 
  GaugeSystem,
  SummonSystem  // 추가
} from '../ecs/systems';

// ECS 컨텍스트 인터페이스 - 순수 시뮬레이션만
interface ECSContextValue {
  world: World;
  step: (deltaTime: number) => void;
}

// ECSContext를 여기서 정의하고 export
export const ECSContext = createContext<ECSContextValue | null>(null);

interface ECSProviderProps {
  children: ReactNode;
}

export const ECSProvider: React.FC<ECSProviderProps> = ({ children }) => {
  const [contextValue, setContextValue] = useState<ECSContextValue | null>(null);

  // World 초기화 - 순수 시뮬레이션 엔진만
  useEffect(() => {
    const newWorld = new World();
    
    // 시스템들 등록
    newWorld.addSystem(new TimeSystem());
    newWorld.addSystem(new StateSystem());
    newWorld.addSystem(new SkillSystem());
    newWorld.addSystem(new BuffSystem());
    newWorld.addSystem(new DamageSystem());
    newWorld.addSystem(new GaugeSystem());
    newWorld.addSystem(new SummonSystem());  // 추가
    
    // step 함수 - 고정 시간 간격으로 시뮬레이션 진행
    const step = (deltaTime: number) => {
      newWorld.update(deltaTime);
    };
    
    setContextValue({
      world: newWorld,
      step
    });

    return () => {
      newWorld.clear();
    };
  }, []);

  if (!contextValue) {
    return <div>ECS 시스템 초기화 중...</div>;
  }

  return (
    <ECSContext.Provider value={contextValue}>
      {children}
    </ECSContext.Provider>
  );
};