"use client";

type TextInputProps = {
  name: string;
  label: string;
  type?: string;
  error: boolean;
  touched: boolean;
  onChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  helperText?: string;
  value?: string; // optional to support file input
  className?: string;
};

export default function TextInput({
  name,
  label,
  type = "text",
  error,
  touched,
  onChange,
  onBlur,
  autoComplete,
  helperText,
  value,
  className = "",
}: TextInputProps) {
  return (
    <>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={label}
        className={[
          "w-full px-4 py-3 rounded-lg border text-sm bg-gray-100 transition dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2",
          error && touched
            ? "border-red-500 ring-2 ring-red-500 focus:ring-red-500"
            : "focus:ring-cyan-400",
          className,
        ].join(" ")}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={!!(error && touched)}
      />

      {error && touched && (
        <p className="text-sm text-red-500 inline">{helperText}</p>
      )}
    </>
  );
}
