import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import type { RiskDistribution } from "../../features/admin/types/dashboard";

interface Props {
  riskDistribution: RiskDistribution;
}

const COLORS = [
  "#EF4444",
  "#F59E0B",
  "#22C55E",
];

function RiskDistributionChart({
  riskDistribution,
}: Props) {

  const data = [
    {
      name: "High Risk",
      value: riskDistribution.high,
    },
    {
      name: "Medium Risk",
      value: riskDistribution.medium,
    },
    {
      name: "Low Risk",
      value: riskDistribution.low,
    },
  ];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={110}
            label
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskDistributionChart;