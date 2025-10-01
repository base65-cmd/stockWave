// components/BarChartCard.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useWindowWidth from "../useWindowWidth";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-2 rounded-lg shadow-md border border-gray-200 text-sm">
        <p className="text-gray-800 font-semibold">{label}</p>
        <p className="text-blue-600">
          {payload[0].name}:{" "}
          <span className="font-medium">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const BarChartDetails = ({ width, height, data, dataKey, rounded }) => {
  return (
    <BarChart
      width={width}
      height={height}
      data={data}
      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
    >
      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#D1D5DB" />
      <XAxis
        dataKey="label"
        interval={0}
        tick={{ fill: "#6b7280", fontSize: 12 }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fill: "#6b7280", fontSize: 12 }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
      <Bar
        dataKey={dataKey}
        fill={"#C3DDFD"}
        radius={rounded ? [6, 6, 0, 0] : [0, 0, 0, 0]}
        barSize={40}
        className="transition-all duration-300 hover:opacity-80"
      />
    </BarChart>
  );
};

export default function BarChartCard({
  data = [],
  dataKey = "value",
  rounded = true,
  className = "",
  height = 300,
}) {
  const windowWidth = useWindowWidth();
  // Dynamically calculate chart width (barSize * numBars + padding)
  const chartWidth = data.length * 60; // adjust multiplier for spacing

  if (windowWidth > 650) {
    return (
      <ResponsiveContainer width={"100%"} height={height}>
        <BarChartDetails rounded={rounded} dataKey={dataKey} data={data} />
      </ResponsiveContainer>
    );
  }
  return (
    <div className={`overflow-x-auto categories ${className}`}>
      <div style={{ width: chartWidth, height }}>
        <BarChartDetails
          data={data}
          dataKey={dataKey}
          rounded={rounded}
          width={chartWidth}
          height={height}
        />
      </div>
    </div>
  );
}
