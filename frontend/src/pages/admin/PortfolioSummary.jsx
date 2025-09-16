// PortfolioSummary.jsx
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from "recharts";

export function PortfolioSummary({ portfolio }) {
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{portfolio.name}</h3>
          {portfolio.decisionTarget && (
            <div className="text-sm text-gray-500">
              Decision for:{" "}
              <span className="font-medium text-gray-700">{portfolio.decisionTarget.name}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {Number(portfolio.totalVotes || 0).toLocaleString()} votes
        </div>
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={Array.isArray(portfolio.candidates) ? portfolio.candidates : []}
            margin={{ top: 25, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value, _, entry) => [
                `${value} votes (${entry.payload.percentage || 0}%)`,
                "Votes"
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar
              dataKey="votes"
              radius={[4, 4, 0, 0]}
              label={{ position: 'top', fontSize: 11, fill: '#374151' }}
            >
              {(portfolio.candidates || []).map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
