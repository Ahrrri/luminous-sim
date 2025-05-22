// src/ecs/core/Component.ts
export interface Component {
  readonly type: string;
}

export abstract class BaseComponent implements Component {
  abstract readonly type: string;
}

// 컴포넌트 타입 체크를 위한 유틸리티
export function isComponentOfType<T extends Component>(
  component: Component,
  type: string
): component is T {
  return component.type === type;
}