import React from "react";
import { PieChart } from "recharts/es6/chart/PieChart";
import { Pie } from "recharts/es6/polar/Pie";
import { Cell } from "recharts/es6/component/Cell";
import { Tooltip } from "recharts/es6/component/Tooltip";
import { ResponsiveContainer } from "recharts/es6/component/ResponsiveContainer";

type ProgrammeRow = {
  programme: string;
  totalCollected: number;
  players: number;
  monthlyFee: number;
  totalExpected: number;
  collectionPct: number;
};

const PIE_COLORS = ["#3B82F6", "#06B6D4", "#8B5CF6", "#22C55E", "#F59E0B", "#EF4444"];

const INR = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const ProgrammeBreakdownChart: React.FC<{ data: ProgrammeRow[]; height?: number }> = ({ data, height = 300 }) => {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="totalCollected"
            nameKey="programme"
            outerRadius={110}
            label={(entry: ProgrammeRow) => `${entry.programme}`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => `₹${INR.format(Number(value || 0))}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgrammeBreakdownChart;
