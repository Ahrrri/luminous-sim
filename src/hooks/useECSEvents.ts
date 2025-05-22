// src/hooks/useECSEvents.ts
import { useEffect } from 'react';
import { useECS } from './useECS';
import type { Entity } from '../ecs/core/Entity';
import type { Component } from '../ecs/core/Component';
import type { SystemEventCallback } from '../ecs/core/World';

export function useECSEvents(eventType: string, callback: SystemEventCallback): void {
  const world = useECS();

  useEffect(() => {
    world.on(eventType, callback);

    return () => {
      world.off(eventType, callback);
    };
  }, [world, eventType, callback]);
}