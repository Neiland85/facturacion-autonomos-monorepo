import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInvoices } from '../services/apiService';
import { getInvoiceSuggestions } from '../services/geminiService';
import { Invoice, InvoiceStatus, InvoiceStatusLabels, View, InvoiceSuggestion, SubscriptionTier, VoiceInvoiceData } from '../types';
import { PlusIcon, DocumentTextIcon, TagIcon, SparklesIcon, XIcon, MicrophoneIcon, DiamondIcon } from './icons';
import { useSound } from '../hooks/useSound';
import VoiceCommandModal from './VoiceCommandModal';

const InvoiceStatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
        const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full inline-block";
        const statusClasses: Record<InvoiceStatus, string> = {
            [InvoiceStatus.Draft]: "bg-slate-500/20 text-slate-400",
            [InvoiceStatus.Sent]: "bg-blue-500/20 text-blue-400",
            [InvoiceStatus.Paid]: "bg-green-500/20 text-green-400",
            [InvoiceStatus.Overdue]: "bg-red-500/20 text-red-400",
            [InvoiceStatus.Cancelled]: "bg-slate-500/20 text-slate-400",
        };
        return <span className={`${baseClasses} ${statusClasses[status]}`}>{InvoiceStatusLabels[status]}</span>;
};

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
    const lowerCategory = category.toLowerCase();
    let colorClasses = "bg-slate-500/20 text-slate-500 dark:text-slate-400"; // Default
    if (lowerCategory.includes('ingreso')) {
        colorClasses = "bg-green-500/20 text-green-500";
    } else if (lowerCategory.includes('servicios')) {
        colorClasses = "bg-blue-500/20 text-blue-500";
    } else if (lowerCategory.includes('diseño')) {
        colorClasses = "bg-purple-500/20 text-purple-500";
    } else if (lowerCategory.includes('gasto')) {
        colorClasses = "bg-amber-500/20 text-amber-500";
    }

    return (
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
            <TagIcon className="w-3.5 h-3.5" />
            {category}
        </div>
    );
};

const InvoiceRow: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
    const concept = invoice.lines[0]?.description || invoice.notes || 'Sin descripción';
    const formattedIssueDate = new Date(invoice.issueDate).toLocaleDateString('es-ES');

    return (
        <tr className="block mb-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 sm:table-row sm:p-0 sm:mb-0 sm:border-b sm:border-slate-100 dark:sm:border-slate-700 sm:bg-transparent dark:sm:bg-transparent sm:hover:bg-slate-50 dark:sm:hover:bg-slate-800/50">
            <td className="block p-1 sm:table-cell sm:p-4 font-medium text-slate-900 dark:text-white">
                <div className="flex justify-between items-center sm:block">
                    <span className="font-bold text-slate-500 dark:text-slate-400 sm:hidden">Número</span>
                    <span>{invoice.number}</span>
                </div>
            </td>
            <td className="block p-1 sm:table-cell sm:p-4 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center sm:block">
                    <span className="font-bold text-slate-500 dark:text-slate-400 sm:hidden">Cliente</span>
                    <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{invoice.client.name}</p>
                        {concept && <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{concept}</p>}
                    </div>
                </div>
            </td>
            <td className="block p-1 sm:table-cell sm:p-4 text-slate-500 dark:text-slate-400">
                <div className="flex justify-between items-center sm:block">
                    <span className="font-bold text-slate-500 dark:text-slate-400 sm:hidden">Emisión</span>
                    <span>{formattedIssueDate}</span>
                </div>
            </td>
            <td className="block p-1 sm:table-cell sm:p-4">
                <div className="flex justify-between items-center sm:block">
                    <span className="font-bold text-slate-500 dark:text-slate-400 sm:hidden">Concepto</span>
                    <CategoryBadge category={concept} />
                </div>
            </td>
            <td className="block p-1 font-semibold sm:text-right">
                <div className="flex justify-between items-center sm:block">
                    <span className="font-bold text-slate-500 dark:text-slate-400 sm:hidden">Importe</span>
                    <span className="text-slate-900 dark:text-white">€{invoice.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </td>
            <td className="block p-1 mt-2 sm:mt-0 sm:table-cell sm:p-4 sm:text-right">
                <div className="flex justify-between items-center sm:block">
                    <span className="font-bold text-slate-500 dark:text-slate-400 sm:hidden">Estado</span>
                    <InvoiceStatusBadge status={invoice.status} />
                </div>
            </td>
        </tr>
    );
};

interface InvoicesProps {
  setView: (view: View) => void;
  lastCreatedInvoice: Invoice | null;
  clearLastCreatedInvoice: () => void;
  onUseSuggestion: (suggestion: InvoiceSuggestion) => void;
  subscriptionTier: SubscriptionTier;
  onVoiceCommandComplete: (data: VoiceInvoiceData) => void;
}

const Invoices: React.FC<InvoicesProps> = ({ setView, lastCreatedInvoice, clearLastCreatedInvoice, onUseSuggestion, subscriptionTier, onVoiceCommandComplete }) => {
    const { playSound } = useSound();
    const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['invoices', { page, statusFilter, searchTerm }],
        queryFn: () => getInvoices({
            page,
            limit: 10,
            status: statusFilter === 'all' ? undefined : statusFilter,
            search: searchTerm ? searchTerm : undefined,
        }),
        keepPreviousData: true,
    });
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const isFreeTier = subscriptionTier === 'free';

    // State for AI suggestions
    const [suggestions, setSuggestions] = useState<InvoiceSuggestion[]>([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (lastCreatedInvoice) {
                setIsFetchingSuggestions(true);
                setSuggestions([]);
                try {
                    const results = await getInvoiceSuggestions(lastCreatedInvoice);
                    setSuggestions(results);
                    if (results.length > 0) playSound('notify');
                    await refetch();
                } catch (error) {
                    console.error("Failed to fetch invoice suggestions", error);
                } finally {
                    setIsFetchingSuggestions(false);
                    clearLastCreatedInvoice();
                }
            }
        };
        fetchSuggestions();
    }, [lastCreatedInvoice, clearLastCreatedInvoice, playSound, refetch]);
    
    const handleNewInvoiceClick = () => {
        playSound('open');
        setView('new-invoice');
    }
    
    const handleVoiceCommandClick = () => {
        if (isFreeTier) {
            playSound('error');
            setView('pricing');
        } else {
            playSound('open');
            setIsVoiceModalOpen(true);
        }
    }
    
    const handleUseSuggestionClick = (suggestion: InvoiceSuggestion) => {
        playSound('click');
        onUseSuggestion(suggestion);
    }
    
    const handleDismissSuggestions = () => {
        playSound('close');
        setSuggestions([]);
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const handleStatusFilterChange = (value: 'all' | InvoiceStatus) => {
        setStatusFilter(value);
        setPage(1);
    };

    const goToPreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const goToNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const invoices = useMemo(() => data?.items ?? [], [data]);
    const totalPages = data?.totalPages ?? 1;
    const totalItems = data?.total ?? invoices.length;
    const isEmpty = !isLoading && !isFetching && invoices.length === 0;

    return (
        <>
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Facturas</h2>
                    <p className="text-slate-500 dark:text-slate-400">Gestiona todas tus facturas emitidas.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleVoiceCommandClick}
                        className={`relative group font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors ${
                            isFreeTier 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                            : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white'
                        }`}
                    >
                        <MicrophoneIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">¡HÁBLAME!</span>
                         {isFreeTier && (
                             <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow">
                                <span className="font-bold text-xs">Pro</span>
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={handleNewInvoiceClick}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Nueva Factura</span>
                        <span className="sm:hidden">Nueva</span>
                    </button>
                </div>
            </div>

            {(isFetchingSuggestions || suggestions.length > 0) && (
                <div className="bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 p-4 rounded-xl">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <SparklesIcon className="w-6 h-6 text-orange-500" />
                            <div>
                                <h3 className="text-lg font-bold text-orange-800 dark:text-orange-300">Sugerencias de IA</h3>
                                <p className="text-sm text-orange-700 dark:text-orange-400">¿Crear una factura recurrente?</p>
                            </div>
                        </div>
                        <button onClick={handleDismissSuggestions} className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200">
                            <XIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    {isFetchingSuggestions && <p className="text-center p-4 text-slate-500 dark:text-slate-400">Buscando sugerencias...</p>}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {suggestions.map((s, i) => (
                            <div key={i} className="bg-white/50 dark:bg-slate-800/30 p-4 rounded-lg">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{s.description}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Para: {s.clientName}</p>
                                <div className="flex justify-between items-center mt-3">
                                    <p className="font-bold text-lg text-slate-900 dark:text-white">€{s.amount.toLocaleString('es-ES')}</p>
                                    <button onClick={() => handleUseSuggestionClick(s)} className="bg-orange-500 text-white font-semibold text-sm py-1.5 px-3 rounded-lg hover:bg-orange-600">
                                        Usar esta Factura
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
                    <input
                        type="search"
                        placeholder="Buscar por cliente o número..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 border border-transparent"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', InvoiceStatus.Sent, InvoiceStatus.Paid, InvoiceStatus.Overdue, InvoiceStatus.Draft] as const).map(f => (
                         <button 
                            key={f}
                            onClick={() => handleStatusFilterChange(f)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${statusFilter === f ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                         >
                            {f === 'all' ? 'Todas' : InvoiceStatusLabels[f]}
                        </button>
                    ))}
                </div>
            </div>
            
             <div>
                <table className="w-full text-sm block sm:table">
                    <thead className="hidden sm:table-header-group bg-slate-50 dark:bg-slate-800/50 text-left text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="p-4 font-semibold">Número</th>
                            <th className="p-4 font-semibold">Cliente / Concepto</th>
                            <th className="p-4 font-semibold">Emisión</th>
                            <th className="p-4 font-semibold">Categoría (IA)</th>
                            <th className="p-4 font-semibold text-right">Importe</th>
                            <th className="p-4 font-semibold text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="block sm:table-row-group">
                        {(isLoading || isFetching) && (
                            <tr>
                                <td colSpan={6} className="block sm:table-cell text-center p-10">Cargando facturas...</td>
                            </tr>
                        )}
                        {isError && (
                             <tr>
                                <td colSpan={6} className="block sm:table-cell text-center p-10 text-red-500">Error al cargar las facturas.</td>
                            </tr>
                        )}
                        {!isLoading && !isFetching && !isError && invoices.map(invoice => <InvoiceRow key={invoice.id} invoice={invoice} />)}
                    </tbody>
                </table>

                {isEmpty && (
                     <div className="text-center p-10 mt-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <DocumentTextIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                        <h3 className="mt-4 font-semibold">No se encontraron facturas</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No hay facturas que coincidan con el filtro actual.</p>
                     </div>
                )}
                {!isEmpty && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={page === 1}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${page === 1 ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white'}`}
                            >
                                Anterior
                            </button>
                            <button
                                onClick={goToNextPage}
                                disabled={page === totalPages}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${page === totalPages ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                            >
                                Siguiente
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Página {page} de {totalPages} · {totalItems} facturas
                        </p>
                    </div>
                )}
            </div>
        </div>
        <VoiceCommandModal 
            isOpen={isVoiceModalOpen}
            onClose={() => setIsVoiceModalOpen(false)}
            onCommandComplete={onVoiceCommandComplete}
        />
        </>
    );
};

export default Invoices;