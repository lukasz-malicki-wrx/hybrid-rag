"use client";

import { FIELD_LABEL } from "./field";
import { Radio } from "./radio";

export type RadioOption<T extends string> = { value: T; label: string };

/** A labelled set of radio buttons. */
export function RadioGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className={`${FIELD_LABEL} mb-1.5`}>{legend}</legend>
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          label={option.label}
        />
      ))}
    </fieldset>
  );
}
