'use client'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

type ChartData = {
    date: string
    weight: number
}

export default function ProgressChart({ data } : { data: ChartData[]}) {
    if(!data || data.length < 2) {
        return (
            <div className="h-48 flex items-center justify-center bg-gray-900/50 rounded-lg border border-gray-700 border-dashed text-gray-500 text-sm">
                Necesitas al menos 2 entrenamientos para ver la curva 📉
            </div>
        )
    }
    return (
        <div className="w-full h-56 bg-gray-900/50 p-2 rounded-lg border border-gray-800 mb-6 animate-in fade-in zoom-in duration-300">
            <h4 className='text-sm text-center text-gray-400 mb-2 uppercase tracking-wider'>Progreso de cargas</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis 
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                    />
                    <YAxis 
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={["dataMin - 5", "dataMax + 5"]}
                        unit="kg"
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px", color: "#fff"}}
                        itemStyle={{ color: "#60A5FA"}}
                        formatter={(value) => [`${value} kg`, "Carga"]}
                        labelStyle={{ color: "#9CA3AF", marginBottom: "0,5rem"}}
                    />
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#1F2937"}}
                        activeDot={{ r: 6, fill: "#60A5FA" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}