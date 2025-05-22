// src/components/Settings/InputField.tsx
import React from 'react';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1
}) => {
  return (
    <div className="input-field">
      <label className="input-label">{label}</label>
      <input
        type="number"
        className="input-control"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
};