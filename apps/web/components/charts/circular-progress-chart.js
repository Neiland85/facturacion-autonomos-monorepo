"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recharts_1 = require("recharts");
const CircularProgressChart = ({ percentage, size = 100, strokeWidth = 10, label, description, color = "#8884d8", }) => {
    const data = [
        { name: "Progress", value: percentage },
        { name: "Remaining", value: 100 - percentage },
    ];
    const COLORS = [color, "#ddd"];
    return (<recharts_1.ResponsiveContainer width={size} height={size}>
      <recharts_1.PieChart width={size} height={size}>
        <recharts_1.Pie data={data} cx="50%" cy="50%" innerRadius={size / 2 - strokeWidth} outerRadius={size / 2} startAngle={90} endAngle={-270} paddingAngle={0} dataKey="value">
          {data.map((entry, index) => (<recharts_1.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
        </recharts_1.Pie>
        <recharts_1.Tooltip content={({ payload }) => {
            if (payload && payload.length) {
                const currentPayload = payload.find((p) => p.name === "Progress");
                if (currentPayload) {
                    return (<div className="bg-background border border-border shadow-lg rounded-md p-2 text-sm">
                    <p className="font-semibold text-foreground">
                      {label || "Progreso"}: {Number(currentPayload.value).toFixed(1)}%
                    </p>
                    {description && <p className="text-muted-foreground text-xs">{description}</p>}
                  </div>);
                }
            }
            return null;
        }}/>
      </recharts_1.PieChart>
    </recharts_1.ResponsiveContainer>);
};
exports.default = CircularProgressChart;
