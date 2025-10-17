import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '../services/apiService';
import { DashboardData, Invoice, InvoiceStatus, InvoiceStatusLabels, View, SubscriptionTier } from '../types';
import { DocumentTextIcon, SparklesIcon, DiamondIcon } from './icons';
import { useSound } from '../hooks/useSound';

const StatCard = ({ title, value, change, subtext }: { title: string, value: string, change?: number, subtext: string }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
            {change !== undefined && (
                <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change >= 0 ? '+' : ''}{change}%
                </span>
            )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtext}</p>
    </div>
);

const InvoiceStatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full";
    const statusClasses: Record<InvoiceStatus, string> = {
        [InvoiceStatus.Draft]: "bg-slate-500/20 text-slate-400",
        [InvoiceStatus.Sent]: "bg-blue-500/20 text-blue-400",
        [InvoiceStatus.Paid]: "bg-green-500/20 text-green-400",
        [InvoiceStatus.Overdue]: "bg-red-500/20 text-red-400",
        [InvoiceStatus.Cancelled]: "bg-slate-500/20 text-slate-400",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{InvoiceStatusLabels[status]}</span>;
};

const RecentInvoiceItem: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
    const formattedDate = new Date(invoice.issueDate).toLocaleDateString('es-ES');

    return (
        <li className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                    <DocumentTextIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{invoice.client.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{formattedDate}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-slate-800 dark:text-white">€{invoice.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <InvoiceStatusBadge status={invoice.status} />
            </div>
        </li>
    );
};

interface DashboardProps {
    setView: (view: View) => void;
    subscriptionTier: SubscriptionTier;
}

const Dashboard: React.FC<DashboardProps> = ({ setView, subscriptionTier }) => {
    const { playSound } = useSound();
    const { data, isLoading, isError } = useQuery<DashboardData>({
        queryKey: ['dashboardData'],
        queryFn: getDashboardData
    });

    if (isLoading) {
        return <div className="text-center p-10">Cargando dashboard...</div>;
    }

    if (isError || !data) {
        return <div className="text-center p-10 text-red-500 dark:text-red-400">Error al cargar los datos del dashboard.</div>;
    }

    const handleAiAssistantClick = () => {
        playSound('open');
        setView('ai-assistant');
    }
    
    const handlePricingClick = () => {
        playSound('click');
        setView('pricing');
    }

    const totalInvoices = data.totals.totalInvoices;
    const totalRevenue = data.totals.totalRevenue;
    const subtotal = data.totals.subtotal;
    const vatAmount = data.totals.vatAmount;

    const paidSummary = data.byStatus.find(item => item.status === InvoiceStatus.Paid);
    const pendingSummaries = data.byStatus.filter(item => item.status === InvoiceStatus.Sent || item.status === InvoiceStatus.Overdue);
    const draftSummary = data.byStatus.find(item => item.status === InvoiceStatus.Draft);

    const pendingAmount = pendingSummaries.reduce((acc, item) => acc + item.totalAmount, 0);
    const pendingCount = pendingSummaries.reduce((acc, item) => acc + item.count, 0);
    const paidAmount = paidSummary?.totalAmount ?? 0;
    const draftCount = draftSummary?.count ?? 0;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
                <p className="text-slate-500 dark:text-slate-400">Bienvenido de nuevo, aquí tienes un resumen de tu actividad.</p>
            </div>
            
             {subscriptionTier === 'free' && (
                <div className="bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                             <DiamondIcon className="w-8 h-8"/>
                            <h3 className="text-2xl font-bold">Desbloquea todo el potencial</h3>
                        </div>
                        <p className="mt-2 opacity-90 max-w-2xl">
                            Actualiza a un plan Pro o Empresa para acceder a funciones de IA avanzadas, facturación ilimitada y soporte prioritario.
                        </p>
                    </div>
                    <button 
                        onClick={handlePricingClick}
                        className="bg-white/90 text-amber-600 font-bold py-3 px-6 rounded-xl shadow-md hover:bg-white hover:scale-105 transition-all self-start md:self-center flex-shrink-0"
                    >
                       Ver Planes
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard 
                    title="Facturas totales"
                    value={totalInvoices.toString()}
                    subtext={`${paidSummary?.count ?? 0} pagadas · ${draftCount} borradores`}
                />
                <StatCard 
                    title="Ingresos acumulados"
                    value={`€${totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtext={`Subtotal €${subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · IVA €${vatAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                 <StatCard 
                    title="Pendiente de cobro"
                    value={`€${pendingAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtext={`En ${pendingCount} facturas · Pagado €${paidAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Facturas Recientes</h3>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                        {data.recentInvoices.map(invoice => <RecentInvoiceItem key={invoice.id} invoice={invoice} />)}
                    </ul>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 rounded-xl text-white flex flex-col justify-between">
                    <div>
                        <SparklesIcon className="w-8 h-8 opacity-50" />
                        <h3 className="text-xl font-bold mt-4">Asistente TRiBuBot</h3>
                        <p className="mt-2 opacity-90">¿Tienes dudas sobre impuestos, facturación o subvenciones? Pregúntale a nuestra IA experta.</p>
                    </div>
                    <button onClick={handleAiAssistantClick} className="mt-6 bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg self-start transition-colors">
                        Iniciar Chat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;