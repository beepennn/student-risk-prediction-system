import type {
  ReactNode,
} from "react";


interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
}


function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 lg:p-6">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-slate-500 sm:text-base">
            {title}
          </p>

          <p className="mt-2 wrap-break-word text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {value}
          </p>
        </div>

        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-12 sm:w-12">
            {icon}
          </div>
        )}
      </div>
    </article>
  );
}


export default StatCard;