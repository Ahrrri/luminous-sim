// src/ecs/core/System.ts
import type { World } from './World';

export abstract class System {
  abstract readonly name: string;
  protected world!: World;

  // 시스템이 World에 등록될 때 호출
  setWorld(world: World): void {
    this.world = world;
  }

  // 시스템 초기화
  init(): void {}

  // 매 프레임마다 호출되는 업데이트 로직
  abstract update(deltaTime: number): void;

  // 시스템 정리
  cleanup(): void {}
}