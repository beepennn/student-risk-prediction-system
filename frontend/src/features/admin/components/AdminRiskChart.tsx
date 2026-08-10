import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Props = {
  high: number;
  medium: number;
  low: number;
};

const COLORS = [
  "#EF4444",
  "#F59E0B",
  "#22C55E",
];

function AdminRiskChart({
  high,
  medium,
  low,
}: Props) {
  const data = [
    {
      name: "High Risk",
      value: high,
    },
    {
      name: "Medium Risk",
      value: medium,
    },
    {
      name: "Low Risk",
      value: low,
    },
  ];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
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

export default AdminRiskChart;