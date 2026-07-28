import type {
  ButtonHTMLAttributes,
} from "react";

import clsx from "clsx";


type ButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement>;


function Button({
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={clsx(
        "inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-[15px] font-semibold text-white transition",
        "hover:bg-blue-700",
        "focus:outline-none focus:ring-4 focus:ring-blue-200",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}


export default Button;