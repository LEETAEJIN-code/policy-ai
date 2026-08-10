import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";


interface SyncLog {
    id: number;
    created_at: string;
    collected_count: number;
    inserted_count: number;
    updated_count: number;
    status: string;
}


interface AdminSyncChartProps {
    logs: SyncLog[];
}


function formatChartDate(
    value: string,
): string {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return "확인 불가";
    }

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            month: "2-digit",
            day: "2-digit",
        },
    ).format(date);
}


export default function AdminSyncChart({
    logs,
}: AdminSyncChartProps) {
    const chartData =
        [...logs]
            .slice(0, 10)
            .reverse()
            .map((log) => ({
                date:
                    formatChartDate(
                        log.created_at,
                    ),

                수집:
                    log.collected_count,

                신규:
                    log.inserted_count,

                업데이트:
                    log.updated_count,
            }));

    if (
        chartData.length === 0
    ) {
        return null;
    }

    return (
        <section className="admin-chart-section">
            <div className="admin-chart-header">
                <div>
                    <h2>
                        정책 동기화 추이
                    </h2>

                    <p>
                        최근 동기화 작업의 수집,
                        신규, 업데이트 정책 수입니다.
                    </p>
                </div>
            </div>

            <div className="admin-chart-container">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 12,
                            right: 12,
                            bottom: 4,
                            left: 0,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="date"
                        />

                        <YAxis
                            allowDecimals={false}
                        />

                        <Tooltip />

                        <Legend />

                        <Bar
                            dataKey="수집"
                            fill="var(--color-primary)"
                            radius={[
                                5,
                                5,
                                0,
                                0,
                            ]}
                        />

                        <Bar
                            dataKey="신규"
                            fill="#16a34a"
                            radius={[
                                5,
                                5,
                                0,
                                0,
                            ]}
                        />

                        <Bar
                            dataKey="업데이트"
                            fill="#f59e0b"
                            radius={[
                                5,
                                5,
                                0,
                                0,
                            ]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}