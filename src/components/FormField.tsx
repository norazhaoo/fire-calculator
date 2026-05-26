import { useEffect, useState } from "react";
import type { Question } from "../domain/types";

interface FormFieldProps {
  question: Question;
  value: number | string | boolean;
  onChange: (value: number | string | boolean) => void;
}

export function FormField({ question, value, onChange }: FormFieldProps) {
  if (question.inputType === "select") {
    return (
      <div className="form-field">
        <label>
          <span>{question.label}</span>
          <select value={String(value)} onChange={(event) => onChange(event.target.value)}>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {question.helperText ? <small>{question.helperText}</small> : null}
      </div>
    );
  }

  if (question.inputType === "boolean") {
    return (
      <div className="form-field">
        <label className="checkbox-field">
          <input
            checked={Boolean(value)}
            type="checkbox"
            onChange={(event) => onChange(event.target.checked)}
          />
          <span>{question.label}</span>
        </label>
        {question.helperText ? <small>{question.helperText}</small> : null}
      </div>
    );
  }

  return <NumberField question={question} value={value} onChange={onChange} />;
}

function NumberField({ question, value, onChange }: FormFieldProps) {
  const [draft, setDraft] = useState(String(value));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraft(String(value));
    }
  }, [isEditing, value]);

  function commitDraft(nextDraft: string) {
    if (nextDraft === "") {
      return;
    }

    const nextValue = Number(nextDraft);

    if (Number.isFinite(nextValue)) {
      onChange(nextValue);
    }
  }

  function commitAndNormalizeDraft() {
    commitDraft(draft);

    if (draft !== "") {
      const nextValue = Number(draft);

      if (Number.isFinite(nextValue)) {
        setDraft(String(nextValue));
      }
    }
  }

  return (
    <div className="form-field">
      <label>
        <span>{question.label}</span>
        <input
          inputMode="decimal"
          type="number"
          value={draft}
          onBlur={() => {
            setIsEditing(false);
            commitAndNormalizeDraft();
          }}
          onChange={(event) => {
            const nextDraft = event.target.value;
            setDraft(nextDraft);
            commitDraft(nextDraft);
          }}
          onFocus={() => setIsEditing(true)}
        />
      </label>
      {question.helperText ? <small>{question.helperText}</small> : null}
    </div>
  );
}
