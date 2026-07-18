import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
};

function Card({ children }: CardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      {children}
    </div>
  );
}

export default Card;