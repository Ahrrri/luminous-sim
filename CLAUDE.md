# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Luminous character skill simulator for MapleStory, built with React, TypeScript, and Vite. It uses an Entity-Component-System (ECS) architecture to simulate complex game mechanics including skill rotations, damage calculations, buff management, and gauge systems.

## Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Type check + production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Type Checking
Since there's no dedicated type check command, use the build command which includes TypeScript checking:
```bash
npm run build        # Runs tsc -b && vite build
```

## Architecture

### ECS (Entity-Component-System) Pattern
The core game logic uses ECS architecture located in `/src/ecs/`:

- **Entities**: Basic game objects with unique IDs (player, enemy, summons)
- **Components**: Data containers attached to entities
  - `StatsComponent`: Character stats (STR, INT, damage%, etc.)
  - `SkillComponent`: Individual skill instances with cooldowns
  - `BuffComponent`: Active buffs with durations
  - `DamageComponent`: Damage calculation data
  - `GaugeComponent`: Light/Dark gauge state
  - `StateComponent`: Luminous equilibrium states
  - `SummonComponent`: Summon entities
- **Systems**: Logic processors that operate on components
  - `TimeSystem`: Manages game time and delta updates
  - `SkillSystem`: Handles skill activation and cooldowns
  - `BuffSystem`: Manages buff durations and effects
  - `DamageSystem`: Calculates and applies damage
  - `GaugeSystem`: Manages light/dark gauge mechanics
  - `StateSystem`: Handles Luminous state transitions
- **World**: Central manager orchestrating all ECS elements

### React Integration
- `ECSProvider`: Context provider wrapping the app with ECS World access
- Custom hooks in `/src/hooks/`:
  - `useECS()`: Access World instance
  - `useComponent()`: Subscribe to component changes
  - `useQuery()`: Query entities by component types
  - `useSkillActions()`: High-level skill usage API
  - `useLuminousCharacter()`: Character-specific logic

### UI Structure
Four main panels in `/src/components/`:
1. **SettingsPanel**: Character stats and simulation configuration
2. **AutoSimulationPanel**: Automated skill rotation strategies
3. **ManualPracticePanel**: Real-time skill practice with key bindings
4. **ResultsPanel**: Damage charts, logs, and skill breakdowns

## Key Files

- `/src/data/skills.ts`: All Luminous skill definitions with damage formulas
- `/src/data/types/`: TypeScript types for skills and characters
- `/src/ecs/core/World.ts`: Core ECS world implementation
- `/src/hooks/ECSProvider.tsx`: React-ECS bridge
- `/src/utils/`: Game mechanics utilities (cooldowns, buffs, server lag)

## Game-Specific Mechanics

### Luminous States
- LIGHT: Light skills only
- DARK: Dark skills only  
- EQUILIBRIUM: Both light and dark skills available

### Gauge System
Light/Dark gauge fills based on skill usage, triggering state transitions when reaching thresholds.

### Skill Enhancement
Skills can be enhanced at 5th and 6th job levels, modifying damage and effects.

## ECS System Details

### Component Types

1. **StatsComponent**: Character stats (INT, damage%, boss damage%, final damage%, etc.)
2. **SkillComponent**: Skills with cooldowns and availability states
3. **DamageComponent**: Damage accumulation and history tracking
4. **BuffComponent**: Active buff management with durations
5. **StateComponent**: Luminous state tracking (LIGHT/DARK/EQUILIBRIUM)
6. **GaugeComponent**: Light/Dark gauge values and thresholds
7. **SummonComponent**: Summon entity data
8. **LearnedSkillsComponent**: Learned skill levels and enhancements

### Damage Calculation Flow (DamageSystem)

1. **Get Enhanced Skill Data**
   - Apply 5th job reinforcement (damage multiplier)
   - Apply 6th job mastery (skill override)
   - Handle dynamic skills based on current state

2. **Calculate Additional Hits**
   - Same element: 0.5x additional hits
   - Equilibrium skills: 1.0x additional hits
   - Mixed element: No additional hits

3. **Apply All Multipliers**
   - Base damage %
   - Damage increase % (from buffs)
   - Boss damage %
   - Final damage %
   - Critical rate/damage
   - Mastery range

4. **Apply Enemy Defense Reduction**
   - Level penalty
   - Defense reduction (with ignore defense %)
   - Elemental resistance (with ignore elemental resist %)

5. **Calculate Final Damage**
   - `Final Damage = Base × All Multipliers × Hit Count × Enemy Reduction`

### Skill Enhancement System

#### 5th Job Reinforcement (리인포스)
- Skill IDs: `{skill}_reinforce` (e.g., `reflection_reinforce`)
- Effect: 2% damage increase per level (max level 60)
- Applied as damage multiplier in DamageSystem

#### 6th Job Mastery (VI)
- Skill IDs: `{skill}_mastery` (e.g., `reflection_mastery`)
- Effect: Override skill damage values and other properties
- May affect other skills (e.g., reflection VI increases absolute kill damage)
- Applied via skill_override in getEnhancedSkillData()

#### Dynamic Skills
Skills that change based on Luminous state:
- **Twilight Nova**: Different damage/hitcount per state
- **Punishing Resonator**: Different damage per state
- Use `getDynamicProperties()` to get state-specific values

### Hook Architecture

- **ECSProvider**: Initializes World and all Systems
- **useECS**: Access to World instance and step function
- **useComponent**: Subscribe to component changes with React state updates
- **useQuery**: Query entities by component types
- **useSkillActions**: High-level skill usage API (requires entity and enemyEntity)
- **useLuminousCharacter**: Character-specific state management (creates both player and enemy entities)

### Global Enemy Entity Management

The simulation uses a global enemy entity approach:
- Created in `useLuminousCharacter` alongside the player entity
- Enemy has EnemyStatsComponent with level, defense, and resistances
- Default enemy: Level 285, 1200 defense, no elemental resistances
- Both entities are cleaned up when the character hook unmounts

### Current Implementation Issues vs README.md

1. **Equilibrium Delay State**: Not implemented (README mentions "이퀼리브리엄 유예" state)
2. **Memorize Logic**: Missing gauge reset and 17-second duration without buff extension
3. **30ms Tick System**: Currently uses variable deltaTime instead of fixed 30ms ticks
4. **Server Lag Simulation**: Mentioned in README but not fully implemented
5. **Gauge Charging Rules**: Complex state-dependent charging rules need verification