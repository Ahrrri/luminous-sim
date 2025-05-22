// src/ecs/core/index.ts
export { Entity } from './Entity';
export type { EntityId } from './Entity';
export { BaseComponent } from './Component';
export type { Component } from './Component';
export { isComponentOfType } from './Component';
export { System } from './System';
export { World } from './World';
export type { ComponentStore, SystemEventCallback } from './World';