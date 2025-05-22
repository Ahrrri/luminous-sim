// src/components/Settings/SelectField.tsx
import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options
}) => {
  return (
    <div className="select-field">
      <label className="select-label">{label}</label>
      <select
        className="select-control"
        value={value}
        onChange={(e) => {
          const newValue = isNaN(Number(e.target.value)) 
            ? e.target.value 
            : Number(e.target.value);
          onChange(newValue);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};