"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

import authStyles from "./account-auth.module.css";
import styles from "./password-field.module.css";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  fieldClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
};

export function PasswordField({
  id,
  label,
  fieldClassName,
  labelClassName,
  inputClassName,
  className,
  ...inputProps
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={fieldClassName ?? authStyles.field}>
      <label htmlFor={id} className={labelClassName ?? authStyles.fieldLabel}>
        {label}
      </label>
      <div className={styles.passwordWrap}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={`${inputClassName ?? authStyles.authInput} ${styles.passwordInput} ${className ?? ""}`}
          {...inputProps}
        />
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={() => setVisible((show) => !show)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          tabIndex={0}
        >
          {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
    </div>
  );
}
