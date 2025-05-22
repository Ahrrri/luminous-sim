// src/ecs/core/Entity.ts
export type EntityId = number;

export class Entity {
  public readonly id: EntityId;
  private static nextId = 1;

  constructor() {
    this.id = Entity.nextId++;
  }

  equals(other: Entity): boolean {
    return this.id === other.id;
  }

  toString(): string {
    return `Entity(${this.id})`;
  }
}