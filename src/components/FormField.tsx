import type { Question } from "../domain/types";

interface FormFieldProps {
  question: Question;
  value: number | string | boolean;
  onChange: (value: number | string | boolean) => void;
}

export function FormField({ question, value, onChange }: FormFieldProps) {
  if (question.inputType === "select") {
    return (
      <label className="form-field">
        <span>{question.label}</span>
        <select value={String(value)} onChange={(event) => onChange(event.target.value)}>
          {question.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (question.inputType === "boolean") {
    return (
      <label className="form-field checkbox-field">
        <input
          checked={Boolean(value)}
          type="checkbox"
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{question.label}</span>
      </label>
    );
  }

  return (
    <label className="form-field">
      <span>{question.label}</span>
      <input
        inputMode="decimal"
        type="number"
        value={Number(value)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
