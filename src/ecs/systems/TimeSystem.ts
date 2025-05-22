// src/ecs/systems/TimeSystem.ts
import { System } from '../core/System';
import { TimeComponent } from '../components/TimeComponent';

export class TimeSystem extends System {
  readonly name = 'TimeSystem';

  update(deltaTime: number): void {
    const entities = this.world.query(['time']);
    
    entities.forEach(entity => {
      const timeComp = this.world.getComponent<TimeComponent>(entity, 'time');
      if (timeComp) {
        const newTime = timeComp.currentTime + deltaTime;
        timeComp.update(newTime);
      }
    });
  }
}