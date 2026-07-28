import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import clsx from "clsx";


interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}


function Card({
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={clsx(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}


export default Card;