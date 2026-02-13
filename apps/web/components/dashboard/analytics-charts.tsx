"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

const data = [
    { name: "Mon", revenue: 4000 },
    { name: "Tue", revenue: 3000 },
    { name: "Wed", revenue: 2000 },
    { name: "Thu", revenue: 2780 },
    { name: "Fri", revenue: 1890 },
    { name: "Sat", revenue: 2390 },
    { name: "Sun", revenue: 3490 },
];

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

export function RevenueAreaChart() {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(4px)",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px"
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function MarketplacePieChart({ data }: { data: any[] }) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(4px)",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px"
                        }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
const SUNBURST_COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308",
    "#84cc16", "#22c55e", "#10b981", "#14b8a6",
    "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
    "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"
];

export function MarketplaceSunburstChart({ data }: { data: any[] }) {
    // Hierarchical mock data for the sunburst effect
    const innerData = data.map((d, i) => ({ ...d, fill: SUNBURST_COLORS[i % 4 * 4] }));
    const outerData = [
        // Breakdown for first category (e.g., Clubs)
        { name: "Entry Fees", value: 30, fill: "#ef4444" },
        { name: "Table Service", value: 70, fill: "#f87171" },
        // Breakdown for second category (e.g., Hall Leads)
        { name: "Booking Fee", value: 40, fill: "#10b981" },
        { name: "Referral", value: 60, fill: "#34d399" },
        // Breakdown for third category (e.g., Restaurants)
        { name: "Dine-in", value: 50, fill: "#0ea5e9" },
        { name: "Delivery", value: 20, fill: "#38bdf8" },
        { name: "Pre-book", value: 30, fill: "#7dd3fc" },
    ];

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    {/* Inner Level (Categories) */}
                    <Pie
                        data={innerData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        stroke="none"
                    >
                        {innerData.map((entry, index) => (
                            <Cell key={`inner-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    {/* Outer Level (Detailed Breakdown) */}
                    <Pie
                        data={outerData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        stroke="none"
                    >
                        {outerData.map((entry, index) => (
                            <Cell key={`outer-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            color: "#fff",
                            backdropFilter: "blur(4px)",
                            border: "none",
                            borderRadius: "8px"
                        }}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: '10px', paddingLeft: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
