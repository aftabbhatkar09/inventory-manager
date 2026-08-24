import { HashLoader } from "react-spinners";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts";

import { useGetDashboardSummaryQuery } from "../../redux/dashboard/dashboardApi";
import { useGetMonthlyTrendQuery } from "../../redux/dashboard/dashboardApi";
import { useGetOutStandingReportQuery } from "../../redux/report/reportApi";
import { useGetProductsQuery } from "../../redux/product/productApi";

// Validated dataviz palette — categorical slot 1 (blue), slot 2 (orange),
// diverging blue/red pair. See dataviz skill references/palette.md.
const COLOR_BLUE = "#2a78d6";
const COLOR_ORANGE = "#eb6834";
const COLOR_RED = "#e34948";
const GRIDLINE = "#e1e0d9";
const MUTED_INK = "#898781";

const StatTile = ({ label, value, tone = "default" }) => {
  const toneClass =
    tone === "good"
      ? "text-green-600"
      : tone === "bad"
        ? "text-red-600"
        : "text-gray-900";

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${toneClass}`}>{value}</p>
    </div>
  );
};

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-md p-4">
    <h2 className="font-semibold mb-4">{title}</h2>
    <div style={{ width: "100%", height: 300 }}>{children}</div>
  </div>
);

const rupee = (n) => {
  const num = Number(n || 0);
  return `${num < 0 ? "-" : ""}₹${Math.abs(num).toLocaleString()}`;
};

const DashboardPage = () => {
  const { data: summary, isLoading: summaryLoading } =
    useGetDashboardSummaryQuery();
  const { data: trend = [], isLoading: trendLoading } =
    useGetMonthlyTrendQuery();
  const { data: outstanding = [] } = useGetOutStandingReportQuery();
  const { data: products = [] } = useGetProductsQuery();

  if (summaryLoading || trendLoading)
    return (
      <div className="w-full h-full mx-auto flex justify-center items-center">
        <HashLoader color="#4b6fee" />
      </div>
    );

  const topOutstanding = [...outstanding]
    .filter((p) => p.balance !== 0)
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
    .slice(0, 6)
    .map((p) => ({ name: p.partyName, balance: p.balance }))
    .reverse();

  const topStock = [...products]
    .sort((a, b) => (b.stock || 0) - (a.stock || 0))
    .slice(0, 6)
    .map((p) => ({ name: p.name, stock: p.stock || 0 }))
    .reverse();

  const stockByGodownMap = {};
  products.forEach((p) => {
    p.godownStock?.forEach((g) => {
      stockByGodownMap[g.godownName] =
        (stockByGodownMap[g.godownName] || 0) + g.quantity;
    });
  });
  const stockByGodown = Object.entries(stockByGodownMap)
    .map(([name, stock]) => ({ name, stock }))
    .sort((a, b) => b.stock - a.stock)
    .reverse();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatTile label="Products" value={summary.totalProducts} />
        <StatTile
          label="Parties"
          value={`${summary.totalCustomers}C / ${summary.totalSuppliers}S`}
        />
        <StatTile label="Stock Units" value={summary.totalStockUnits} />
        <StatTile
          label="Receivable"
          value={rupee(summary.totalReceivable)}
          tone="good"
        />
        <StatTile
          label="Payable"
          value={rupee(summary.totalPayable)}
          tone="bad"
        />
        <StatTile
          label="Net Position"
          value={rupee(summary.netPosition)}
          tone={summary.netPosition >= 0 ? "good" : "bad"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Sales vs Purchases (last 6 months)">
          <ResponsiveContainer>
            <BarChart data={trend} barCategoryGap="20%" barGap={2}>
              <CartesianGrid vertical={false} stroke={GRIDLINE} />
              <XAxis
                dataKey="month"
                tick={{ fill: MUTED_INK, fontSize: 12 }}
                axisLine={{ stroke: GRIDLINE }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: MUTED_INK, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(value) => rupee(value)} />
              <Legend />
              <Bar
                dataKey="sales"
                name="Sales"
                fill={COLOR_BLUE}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="purchases"
                name="Purchases"
                fill={COLOR_ORANGE}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Outstanding Parties">
          {topOutstanding.length === 0 ? (
            <p className="text-sm text-gray-500">No outstanding balances.</p>
          ) : (
            <ResponsiveContainer>
              <BarChart
                data={topOutstanding}
                layout="vertical"
                barCategoryGap="25%"
              >
                <CartesianGrid horizontal={false} stroke={GRIDLINE} />
                <XAxis
                  type="number"
                  tick={{ fill: MUTED_INK, fontSize: 12 }}
                  axisLine={{ stroke: GRIDLINE }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: MUTED_INK, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(value) => rupee(value)} />
                <ReferenceLine x={0} stroke="#c3c2b7" />
                <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
                  {topOutstanding.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.balance >= 0 ? COLOR_BLUE : COLOR_RED}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Stock by Product">
          {topStock.length === 0 ? (
            <p className="text-sm text-gray-500">No products yet.</p>
          ) : (
            <ResponsiveContainer>
              <BarChart data={topStock} layout="vertical" barCategoryGap="25%">
                <CartesianGrid horizontal={false} stroke={GRIDLINE} />
                <XAxis
                  type="number"
                  tick={{ fill: MUTED_INK, fontSize: 12 }}
                  axisLine={{ stroke: GRIDLINE }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: MUTED_INK, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar dataKey="stock" fill={COLOR_BLUE} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Stock by Godown">
          {stockByGodown.length === 0 ? (
            <p className="text-sm text-gray-500">No godowns yet.</p>
          ) : (
            <ResponsiveContainer>
              <BarChart
                data={stockByGodown}
                layout="vertical"
                barCategoryGap="25%"
              >
                <CartesianGrid horizontal={false} stroke={GRIDLINE} />
                <XAxis
                  type="number"
                  tick={{ fill: MUTED_INK, fontSize: 12 }}
                  axisLine={{ stroke: GRIDLINE }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: MUTED_INK, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar dataKey="stock" fill={COLOR_BLUE} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default DashboardPage;
