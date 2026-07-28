import type {
  ReactNode,
} from "react";

import {
  FiActivity,
  FiBarChart2,
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";


interface AuthPageShellProps {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}


const featureItems = [
  {
    icon: <FiActivity size={20} />,
    title: "Early Risk Detection",
    description:
      "Identify academically at-risk students before performance declines further.",
  },
  {
    icon: <FiBarChart2 size={20} />,
    title: "Explainable Predictions",
    description:
      "Understand the academic factors behind every prediction using SHAP.",
  },
  {
    icon: <FiCheckCircle size={20} />,
    title: "Guided Intervention",
    description:
      "Support students with personalised recommendations and timely action.",
  },
];


function AuthPageShell({
  icon,
  title,
  description,
  children,
}: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-5 sm:px-6 sm:py-8 lg:flex lg:items-center lg:py-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl lg:min-h-170 lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20" />

          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-cyan-400/10" />

          <div className="relative z-10 flex h-full flex-col">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-950/30">
                <FiShield size={28} />
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                XAI StudentAlert
              </p>

              <h1 className="mt-3 max-w-lg text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Student Risk Prediction System
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                An explainable academic monitoring
                system that helps students, teachers
                and administrators take timely action.
              </p>
            </div>

            <div className="mt-9 hidden space-y-5 sm:block lg:mt-12">
              {featureItems.map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                    {feature.icon}
                  </div>

                  <div>
                    <h2 className="font-semibold text-white">
                      {feature.title}
                    </h2>

                    <p className="mt-1 max-w-md text-sm leading-6 text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-5 text-sm text-slate-400 lg:mt-auto">
              Secure access for administrators,
              teachers and students.
            </div>
          </div>
        </aside>

        <main className="flex items-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              {icon}
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h2>

            <p className="mt-3 leading-7 text-slate-500">
              {description}
            </p>

            <div className="mt-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


export default AuthPageShell;