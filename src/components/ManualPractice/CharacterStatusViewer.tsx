// src/components/ManualPractice/CharacterStatusViewer.tsx
import React from 'react';
import { useComponent } from '../../hooks/useComponent';
import type { Entity } from '../../ecs/core/Entity';
import type { StateComponent } from '../../ecs/components/StateComponent';
import type { GaugeComponent } from '../../ecs/components/GaugeComponent';
import type { DamageComponent } from '../../ecs/components/DamageComponent';
import type { BuffComponent } from '../../ecs/components/BuffComponent';
import type { TimeComponent } from '../../ecs/components/TimeComponent';

interface CharacterStatusViewerProps {
  entity: Entity;
}

export const CharacterStatusViewer: React.FC<CharacterStatusViewerProps> = ({
  entity
}) => {
  // ECS 컴포넌트들 직접 구독
  const stateComp = useComponent<StateComponent>(entity, 'state');
  const gaugeComp = useComponent<GaugeComponent>(entity, 'gauge');
  const damageComp = useComponent<DamageComponent>(entity, 'damage');
  const buffComp = useComponent<BuffComponent>(entity, 'buff');
  const timeComp = useComponent<TimeComponent>(entity, 'time');

  const formatNumber = (num: number) => num.toLocaleString();
  
  const getStateLabel = (state: string) => {
    switch (state) {
      case 'LIGHT': return '빛';
      case 'DARK': return '어둠';
      case 'EQUILIBRIUM': return '이퀼리브리엄';
      default: return state;
    }
  };

  // 로딩 상태 체크
  if (!stateComp || !gaugeComp || !damageComp || !timeComp) {
    return (
      <div className="character-status-viewer">
        <h3>캐릭터 상태</h3>
        <div>로딩 중...</div>
      </div>
    );
  }

  // 이퀼리브리엄 남은 시간 계산
  const equilibriumTimeLeft = stateComp.equilibriumEndTime ? 
    Math.max(0, stateComp.equilibriumEndTime - timeComp.currentTime) / 1000 : undefined;

  // 활성 버프 목록
  const activeBuffs = buffComp?.getAllBuffs().map(buff => buff.name) || [];

  return (
    <div className="character-status-viewer">
      <h3>캐릭터 상태</h3>
      
      <div className="current-state">
        <div className="state-info">
          <span className="state-label">현재 상태:</span>
          <span className={`state-value state-${stateComp.currentState.toLowerCase()}`}>
            {getStateLabel(stateComp.currentState)}
          </span>
          {equilibriumTimeLeft && (
            <span className="equilibrium-timer">
              ({equilibriumTimeLeft.toFixed(1)}초 남음)
            </span>
          )}
        </div>
      </div>

      <div className="gauge-container">
        <div className="gauge-item light-gauge">
          <div className="gauge-label">빛 게이지</div>
          <div className="gauge-bar">
            <div 
              className="gauge-fill light"
              style={{ width: `${(gaugeComp.lightGauge / gaugeComp.maxGauge) * 100}%` }}
            />
          </div>
          <div className="gauge-value">{gaugeComp.lightGauge} / {gaugeComp.maxGauge}</div>
        </div>

        <div className="gauge-item dark-gauge">
          <div className="gauge-label">어둠 게이지</div>
          <div className="gauge-bar">
            <div 
              className="gauge-fill dark"
              style={{ width: `${(gaugeComp.darkGauge / gaugeComp.maxGauge) * 100}%` }}
            />
          </div>
          <div className="gauge-value">{gaugeComp.darkGauge} / {gaugeComp.maxGauge}</div>
        </div>
      </div>

      <div className="damage-info">
        <div className="damage-label">총 데미지</div>
        <div className="damage-value">{formatNumber(damageComp.totalDamage)}</div>
      </div>

      <div className="active-buffs">
        <div className="buffs-label">활성 버프</div>
        <div className="buffs-list">
          {activeBuffs.length > 0 ? (
            activeBuffs.map((buff, index) => (
              <span key={index} className="buff-chip">
                {buff}
              </span>
            ))
          ) : (
            <span className="no-buffs">없음</span>
          )}
        </div>
      </div>
    </div>
  );
};