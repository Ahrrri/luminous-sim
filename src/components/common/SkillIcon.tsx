// src/components/common/SkillIcon.tsx
import React, { useState } from 'react';
import type { SkillData } from '../../data/types/skillTypes';

interface SkillIconProps {
  skill: SkillData;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  showFallback?: boolean; // 이미지 실패시 fallback 이모지 표시 여부
}

const SIZE_MAP = {
  small: '20px',
  medium: '32px', 
  large: '48px',
  xlarge: '64px'
} as const;

export const SkillIcon: React.FC<SkillIconProps> = ({
  skill,
  size = 'medium',
  className = '',
  style = {},
  onClick,
  showFallback = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const iconSize = SIZE_MAP[size];

  // 이미지 로드 에러 핸들러
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // 이미지 로드 성공 핸들러
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const baseStyles: React.CSSProperties = {
    width: iconSize,
    height: iconSize,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...style
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: imageError ? 'none' : 'block'
  };

  const fallbackStyles: React.CSSProperties = {
    fontSize: size === 'small' ? '14px' : 
              size === 'medium' ? '20px' : 
              size === 'large' ? '32px' : '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  };

  return (
    <div 
      className={`skill-icon ${className}`}
      style={baseStyles}
      onClick={onClick}
      title={skill.name}
    >
      {/* 스킬 이미지 */}
      {skill.iconPath && !imageError && (
        <img
          src={skill.iconPath}
          alt={skill.name}
          style={imageStyles}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
      )}

      {/* Fallback 이모지 (이미지 로드 실패시 또는 이미지 경로가 없을 때) */}
      {(imageError || !skill.iconPath || (!imageLoaded && showFallback)) && (
        <div style={fallbackStyles}>
          {skill.icon}
        </div>
      )}

      {/* 로딩 상태 표시 (선택사항) */}
      {skill.iconPath && !imageLoaded && !imageError && (
        <div 
          style={{
            ...fallbackStyles,
            opacity: 0.5,
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '2px'
          }}
        >
          {skill.icon}
        </div>
      )}
    </div>
  );
};

// 편의를 위한 사이즈별 컴포넌트들
export const SmallSkillIcon: React.FC<Omit<SkillIconProps, 'size'>> = (props) => (
  <SkillIcon {...props} size="small" />
);

export const MediumSkillIcon: React.FC<Omit<SkillIconProps, 'size'>> = (props) => (
  <SkillIcon {...props} size="medium" />
);

export const LargeSkillIcon: React.FC<Omit<SkillIconProps, 'size'>> = (props) => (
  <SkillIcon {...props} size="large" />
);

export const XLargeSkillIcon: React.FC<Omit<SkillIconProps, 'size'>> = (props) => (
  <SkillIcon {...props} size="xlarge" />
);