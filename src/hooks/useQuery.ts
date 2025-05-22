// src/hooks/useQuery.ts
import { useEffect, useState } from 'react';
import { useECS } from './useECS';
import type { Entity } from '../ecs/core/Entity';
import type { Component } from '../ecs/core/Component';

export function useQuery(componentTypes: string[]): Entity[] {
  const world = useECS();
  const [entities, setEntities] = useState<Entity[]>([]);

  useEffect(() => {
    const updateEntities = () => {
      setEntities(world.query(componentTypes));
    };

    // 초기 데이터 로드
    updateEntities();

    // 관련 컴포넌트 변경 시 업데이트
    const handleComponentChange = (eventType: string, entity: Entity, component?: Component) => {
      if (component && componentTypes.includes(component.type)) {
        updateEntities();
      }
    };

    world.on('component:added', handleComponentChange);
    world.on('component:removed', handleComponentChange);
    world.on('entity:created', updateEntities);
    world.on('entity:destroyed', updateEntities);

    return () => {
      world.off('component:added', handleComponentChange);
      world.off('component:removed', handleComponentChange);
      world.off('entity:created', updateEntities);
      world.off('entity:destroyed', updateEntities);
    };
  }, [world, componentTypes.join(',')]);

  return entities;
}