// src/ecs/components/EnemyStatsComponent.ts
import { BaseComponent } from '../core/Component';

export interface EnemyStatsData {
  level: number;
  maxHp: number;
  currentHp: number;
  defenseRate: number;      // 방어율 % (0~100)
  elementalResist: number;  // 속성 저항 % (0~100)
  isBoss: boolean;
  name: string;
  
  // 추가 속성들 (필요시 확장)
  physicalResist?: number;  // 물리 저항 %
  magicalResist?: number;   // 마법 저항 %
  statusResist?: number;    // 상태이상 저항 %
  knockbackResist?: number; // 넉백 저항 %
}

export class EnemyStatsComponent extends BaseComponent {
  readonly type = 'enemyStats';
  
  constructor(
    public level: number,
    public maxHp: number = Infinity,
    public currentHp: number = Infinity,
    public defenseRate: number = 0,
    public elementalResist: number = 0,
    public isBoss: boolean = true,
    public name: string = 'Unknown Enemy',
    public additionalStats: Partial<EnemyStatsData> = {}
  ) {
    super();
  }

  // 정적 팩토리 메서드들
  static createDummy(config?: Partial<EnemyStatsData>): EnemyStatsComponent {
    return new EnemyStatsComponent(
      config?.level || 255,
      config?.maxHp || Infinity,
      config?.currentHp || Infinity,
      config?.defenseRate || 30,
      config?.elementalResist || 50,
      config?.isBoss !== undefined ? config.isBoss : true,
      config?.name || '허수아비',
      config || {}
    );
  }

  static createBoss(name: string, level: number, config?: Partial<EnemyStatsData>): EnemyStatsComponent {
    return new EnemyStatsComponent(
      level,
      config?.maxHp || 1000000000, // 10억 HP
      config?.currentHp || config?.maxHp || 1000000000,
      config?.defenseRate || 30,
      config?.elementalResist || 50,
      true,
      name,
      {
        physicalResist: 50,
        magicalResist: 50,
        statusResist: 100,
        knockbackResist: 100,
        ...config
      }
    );
  }

  static createMob(name: string, level: number, config?: Partial<EnemyStatsData>): EnemyStatsComponent {
    return new EnemyStatsComponent(
      level,
      config?.maxHp || 100000, // 10만 HP
      config?.currentHp || config?.maxHp || 100000,
      config?.defenseRate || 10,
      config?.elementalResist || 20,
      false,
      name,
      config || {}
    );
  }

  // 체력 관련 메서드
  takeDamage(damage: number): number {
    if (this.currentHp === Infinity) {
      return damage; // 무한 체력이면 그냥 데미지 반환
    }
    
    const actualDamage = Math.min(damage, this.currentHp);
    this.currentHp = Math.max(0, this.currentHp - actualDamage);
    return actualDamage;
  }

  heal(amount: number): number {
    if (this.currentHp === Infinity || this.maxHp === Infinity) {
      return 0; // 무한 체력이면 회복 불필요
    }
    
    const actualHeal = Math.min(amount, this.maxHp - this.currentHp);
    this.currentHp += actualHeal;
    return actualHeal;
  }

  // 상태 확인
  isAlive(): boolean {
    return this.currentHp > 0;
  }

  isDead(): boolean {
    return this.currentHp <= 0;
  }

  isInfiniteHp(): boolean {
    return this.currentHp === Infinity || this.maxHp === Infinity;
  }

  // 체력 비율
  getHpPercentage(): number {
    if (this.isInfiniteHp()) return 100;
    return (this.currentHp / this.maxHp) * 100;
  }

  getRemainingHpRatio(): number {
    if (this.isInfiniteHp()) return 1.0;
    return this.currentHp / this.maxHp;
  }

  // 방어 관련 계산
  getEffectiveDefenseRate(ignoreDefensePercent: number = 0): number {
    // 방어율 무시 적용
    const effectiveDefense = this.defenseRate * (1 - ignoreDefensePercent / 100);
    return Math.max(0, effectiveDefense);
  }

  getEffectiveElementalResist(ignoreElementalResistPercent: number = 0): number {
    // 속성 저항 무시 적용
    const effectiveResist = this.elementalResist * (1 - ignoreElementalResistPercent / 100);
    return Math.max(0, effectiveResist);
  }

  // 레벨 관련
  getLevelDifference(playerLevel: number): number {
    return playerLevel - this.level;
  }

  // 데미지 감소율 계산 (메이플스토리 공식 기반)
  calculateDamageReduction(
    playerLevel: number,
    ignoreDefensePercent: number = 0,
    ignoreElementalResistPercent: number = 0
  ): {
    levelPenalty: number;      // 레벨 차이에 따른 페널티 (0.0 ~ 1.0)
    defenseReduction: number;  // 방어율에 의한 감소 (0.0 ~ 1.0)
    elementalReduction: number; // 속성 저항에 의한 감소 (0.0 ~ 1.0)
    totalMultiplier: number;   // 최종 데미지 배율
  } {
    // 1. 레벨 차이 페널티
    const levelDiff = this.getLevelDifference(playerLevel);
    let levelPenalty = 1.0;
    
    if (levelDiff < 0) {
      // 플레이어가 레벨이 낮은 경우 페널티
      const penalty = Math.abs(levelDiff);
      levelPenalty = Math.max(0.01, 1.0 - (penalty * 0.01)); // 레벨당 1% 감소
    } else if (levelDiff > 0) {
      // 플레이어가 레벨이 높은 경우 약간의 보너스
      levelPenalty = Math.min(1.5, 1.0 + (levelDiff * 0.001)); // 레벨당 0.1% 증가
    }

    // 2. 방어율에 의한 데미지 감소
    const effectiveDefense = this.getEffectiveDefenseRate(ignoreDefensePercent);
    const defenseReduction = 1.0 - (effectiveDefense / 100);

    // 3. 속성 저항에 의한 데미지 감소
    const effectiveElementalResist = this.getEffectiveElementalResist(ignoreElementalResistPercent);
    const elementalReduction = 1.0 - (effectiveElementalResist / 100);

    // 4. 최종 배율 계산
    const totalMultiplier = levelPenalty * defenseReduction * elementalReduction;

    return {
      levelPenalty,
      defenseReduction,
      elementalReduction,
      totalMultiplier: Math.max(0.01, totalMultiplier) // 최소 1% 데미지는 들어감
    };
  }

  // 상태 정보 요약
  getStatusSummary(): string {
    const hp = this.isInfiniteHp() ? '∞' : `${this.currentHp.toLocaleString()}/${this.maxHp.toLocaleString()}`;
    return `${this.name} (Lv.${this.level}) - HP: ${hp} (${this.getHpPercentage().toFixed(1)}%)`;
  }

  // 디버그 정보
  getDebugInfo(): EnemyStatsData {
    return {
      level: this.level,
      maxHp: this.maxHp,
      currentHp: this.currentHp,
      defenseRate: this.defenseRate,
      elementalResist: this.elementalResist,
      isBoss: this.isBoss,
      name: this.name,
      ...this.additionalStats
    };
  }

  // 복사
  clone(): EnemyStatsComponent {
    return new EnemyStatsComponent(
      this.level,
      this.maxHp,
      this.currentHp,
      this.defenseRate,
      this.elementalResist,
      this.isBoss,
      this.name,
      { ...this.additionalStats }
    );
  }

  // 상태 초기화
  reset(): void {
    this.currentHp = this.maxHp;
  }

  // 설정 업데이트
  updateStats(newStats: Partial<EnemyStatsData>): void {
    if (newStats.level !== undefined) this.level = newStats.level;
    if (newStats.maxHp !== undefined) this.maxHp = newStats.maxHp;
    if (newStats.currentHp !== undefined) this.currentHp = newStats.currentHp;
    if (newStats.defenseRate !== undefined) this.defenseRate = newStats.defenseRate;
    if (newStats.elementalResist !== undefined) this.elementalResist = newStats.elementalResist;
    if (newStats.isBoss !== undefined) this.isBoss = newStats.isBoss;
    if (newStats.name !== undefined) this.name = newStats.name;
    
    // 추가 스탯들도 업데이트
    Object.assign(this.additionalStats, newStats);
  }
}