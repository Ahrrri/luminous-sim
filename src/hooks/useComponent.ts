// src/hooks/useComponent.ts
import { useEffect, useState } from 'react';
import { useECS } from './useECS';
import type { Entity } from '../ecs/core/Entity';
import type { Component } from '../ecs/core/Component';

export function useComponent<T extends Component>(
  entity: Entity | null, 
  componentType: string
): T | null {
  const world = useECS();
  const [component, setComponent] = useState<T | null>(null);

  useEffect(() => {
    if (!entity) {
      setComponent(null);
      return;
    }

    const updateComponent = () => {
      const comp = world.getComponent<T>(entity, componentType);
      setComponent(comp || null);
    };

    // 초기 컴포넌트 로드
    updateComponent();

    // 컴포넌트 변경 감지
    const handleComponentChange = (eventType: string, changedEntity: Entity, comp?: Component) => {
      if (changedEntity.id === entity.id && comp?.type === componentType) {
        updateComponent();
      }
    };

    world.on('component:added', handleComponentChange);
    world.on('component:removed', handleComponentChange);

    return () => {
      world.off('component:added', handleComponentChange);
      world.off('component:removed', handleComponentChange);
    };
  }, [world, entity?.id, componentType]);

  return component;
}