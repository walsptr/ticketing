type ButtonProps = {
  type: "button" | "submit" | "reset";
  isDisabled: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

export default function PrimaryButton({
  type = "button",
  isDisabled,
  children,
  className,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={type !== "submit" ? onClick : undefined}
      className={[
        "focus:outline-none text-white font-medium rounded-lg transition duration-300 flex items-center justify-center px-3 py-3",
        isDisabled
          ? "bg-blue-300 cursor-not-allowed"
          : "bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
