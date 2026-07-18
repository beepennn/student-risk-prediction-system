import type { ButtonHTMLAttributes } from "react";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
    >
      {children}
    </button>
  );
}

export default Button;