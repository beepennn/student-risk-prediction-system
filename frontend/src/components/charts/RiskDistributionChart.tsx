import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type {
  RiskDistribution,
} from "../../features/admin/types/dashboard";


interface RiskDistributionChartProps {
  riskDistribution: RiskDistribution;
}


interface RiskChartItem {
  name: string;
  value: number;
  colour: string;
}


const RISK_COLOURS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};


function normalizeCount(
  value: unknown,
): number {
  const numberValue = Number(value);

  if (
    !Number.isFinite(numberValue)
    || numberValue < 0
  ) {
    return 0;
  }

  return numberValue;
}


function RiskDistributionChart({
  riskDistribution,
}: RiskDistributionChartProps) {
  const chartData: RiskChartItem[] = [
    {
      name: "High Risk",
      value: normalizeCount(
        riskDistribution?.high,
      ),
      colour: RISK_COLOURS.high,
    },
    {
      name: "Medium Risk",
      value: normalizeCount(
        riskDistribution?.medium,
      ),
      colour: RISK_COLOURS.medium,
    },
    {
      name: "Low Risk",
      value: normalizeCount(
        riskDistribution?.low,
      ),
      colour: RISK_COLOURS.low,
    },
  ];

  const visibleData = chartData.filter(
    (item) => item.value > 0,
  );

  const totalStudents = chartData.reduce(
    (total, item) =>
      total + item.value,
    0,
  );

  if (totalStudents === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center sm:min-h-72">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-2xl">
            📊
          </div>

          <h3 className="mt-4 font-semibold text-slate-800">
            No risk data available
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Risk distribution will appear after
            predictions have been generated for
            students.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-72 w-full sm:h-80 lg:h-96"
      aria-label="Student risk distribution chart"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart
          margin={{
            top: 10,
            right: 10,
            bottom: 35,
            left: 10,
          }}
        >
          <Pie
            data={visibleData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={105}
            paddingAngle={3}
            stroke="#ffffff"
            strokeWidth={3}
            isAnimationActive
          >
            {visibleData.map((item) => (
              <Cell
                key={item.name}
                fill={item.colour}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => {
              const count = Number(value);

              return [
                `${count} ${
                  count === 1
                    ? "student"
                    : "students"
                }`,
                "Count",
              ];
            }}
          />

          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{
              paddingTop: "18px",
              fontSize: "14px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-3xl font-bold text-slate-900">
          {totalStudents}
        </p>

        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          Predicted
        </p>
      </div>
    </div>
  );
}


export default RiskDistributionChart;