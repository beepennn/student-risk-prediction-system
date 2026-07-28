import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

import clsx from "clsx";


type InputProps =
  InputHTMLAttributes<HTMLInputElement>;


const Input = forwardRef<
  HTMLInputElement,
  InputProps
>(function Input(
  {
    className,
    ...props
  },
  ref,
) {
  return (
    <input
      ref={ref}
      {...props}
      className={clsx(
        "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[15px] text-slate-900 outline-none transition",
        "placeholder:text-slate-400",
        "hover:border-slate-400",
        "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
        "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
        className,
      )}
    />
  );
});


export default Input;