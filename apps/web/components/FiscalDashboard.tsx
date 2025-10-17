
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getFiscalData } from '../services/apiService';
import { FiscalData } from '../types';

const MetricCard = ({ title, value, subtext }: { title: string, value: string, subtext: string }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtext}</p>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
          <p className="label text-slate-400">{`${label}`}</p>
          <p className="intro text-lg font-bold">{`Ingresos: €${payload[0].value.toLocaleString('es-ES')}`}</p>
        </div>
      );
    }
    return null;
  };

const FiscalDashboard: React.FC = () => {
    const [year, setYear] = useState(2024);
    const [quarter, setQuarter] = useState(2);

    const { data, isLoading, isError } = useQuery<FiscalData>({
        queryKey: ['fiscalData', year, quarter],
        queryFn: () => getFiscalData(year, quarter),
    });

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Análisis Fiscal</h2>
                <p className="text-slate-500 dark:text-slate-400">Visualiza el rendimiento de tu negocio.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filtros</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                    <select className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200 dark:border-slate-600">
                        <option>Empresa Principal</option>
                    </select>
                    <select 
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200 dark:border-slate-600"
                    >
                        <option value={2024}>2024</option>
                        <option value={2023}>2023</option>
                    </select>
                    <select
                        value={quarter}
                        onChange={(e) => setQuarter(parseInt(e.target.value))}
                        className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200 dark:border-slate-600"
                    >
                        <option value={1}>Trimestre 1</option>
                        <option value={2}>Trimestre 2</option>
                        <option value={3}>Trimestre 3</option>
                        <option value={4}>Trimestre 4</option>
                    </select>
                </div>
            </div>
            
            {isLoading && <div className="text-center p-10">Cargando análisis...</div>}
            {isError && <div className="text-center p-10 text-red-500 dark:text-red-400">Error al cargar el análisis fiscal.</div>}

            {data && !isLoading && !isError && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <MetricCard title="Gasto Trimestral" value={`€${data.quarterlyExpense.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} subtext="Gastos deducibles" />
                        <MetricCard title="IVA pendiente" value={`€${data.pendingVAT.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} subtext="Estimación a pagar" />
                        <MetricCard title="Facturas Enviadas" value={data.sentInvoices.toString()} subtext="En este trimestre" />
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Ingresos Mensuales ({`T${quarter} ${year}`})</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={data.revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="hsl(var(--slate-500))" />
                                    <YAxis stroke="hsl(var(--slate-500))" tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--slate-200))" className="dark:stroke-slate-700" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FiscalDashboard;