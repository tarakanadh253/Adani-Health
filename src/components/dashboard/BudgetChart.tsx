import { BudgetData } from "@/types";
interface BudgetChartProps {
  data?: BudgetData[];
}
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function BudgetChart({ data = [] }: BudgetChartProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Budget vs Actual Spend</h3>
          <p className="text-sm text-muted-foreground">5D Cost Analysis (₹ Crores)</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-muted-foreground">Planned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-secondary" />
            <span className="text-muted-foreground">Actual</span>
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-lg)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number) => [`₹${value} Cr`, ""]}
              />
              <Bar
                dataKey="planned"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="Planned"
              />
              <Bar
                dataKey="actual"
                fill="hsl(var(--secondary))"
                radius={[4, 4, 0, 0]}
                name="Actual"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No budget data available
          </div>
        )}
      </div>
    </div>
  );
}
