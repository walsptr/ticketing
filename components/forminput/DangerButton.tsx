type ButtonProps = {
  type: "button" | "submit" | "reset";
  isDisabled: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

export default function DangerButton({
  type = "button",
  isDisabled,
  className,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={type !== "submit" ? onClick : undefined}
      className={[
        "focus:outline-none text-white font-medium rounded-lg transition duration-300 flex items-center justify-center px-3 py-1.5",
        isDisabled
          ? "bg-red-300 cursor-not-allowed"
          : "bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
