import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClients } from '../services/apiService';
import { Client, View, Invoice, InvoiceStatus, InvoiceSuggestion, VoiceInvoiceData } from '../types';
import { PaperAirplaneIcon, SparklesIcon } from './icons';
import { useSound } from '../hooks/useSound';

interface NewInvoiceProps {
  setView: (view: View) => void;
  ocrData?: any;
  suggestionData?: InvoiceSuggestion | null;
  voiceData?: VoiceInvoiceData | null;
  onInvoiceCreated: (invoice: Invoice) => void;
}

const NewInvoice: React.FC<NewInvoiceProps> = ({ setView, ocrData, suggestionData, voiceData, onInvoiceCreated }) => {
  const { playSound } = useSound();
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: getClients
  });
  
  const [invoiceNumber, setInvoiceNumber] = useState('INV-006');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState('21');
  const [isProforma, setIsProforma] = useState(false);
  const [errors, setErrors] = useState({
    selectedClient: '',
    amount: '',
    issueDate: '',
    dueDate: '',
  });
  
  useEffect(() => {
    if (ocrData) {
        setInvoiceNumber(ocrData.invoiceNumber || 'INV-007');
        setIssueDate(ocrData.issueDate ? new Date(ocrData.issueDate.split('/').reverse().join('-')).toISOString().split('T')[0] : '');
        setDueDate(ocrData.dueDate ? new Date(ocrData.dueDate.split('/').reverse().join('-')).toISOString().split('T')[0] : '');
        setAmount(ocrData.baseAmount || '');
        setTaxRate(ocrData.taxRate || '21');
        setIsProforma(false);
        if (ocrData.clientName && clients.length > 0) {
            const matchingClient = clients.find(c => c.name.toLowerCase().includes(ocrData.clientName.toLowerCase()));
            if(matchingClient) setSelectedClient(matchingClient.id);
        }
    } else if (suggestionData) {
        if (suggestionData.clientName && clients.length > 0) {
            const matchingClient = clients.find(c => c.name.toLowerCase().includes(suggestionData.clientName.toLowerCase()));
            if(matchingClient) setSelectedClient(matchingClient.id);
        }
        setDescription(suggestionData.description);
        setAmount(String(suggestionData.amount));
        setIsProforma(false);
        setIssueDate(new Date().toISOString().split('T')[0]);
        setDueDate('');
    } else if (voiceData) {
        if (voiceData.clientName && clients.length > 0) {
            const matchingClient = clients.find(c => c.name.toLowerCase().includes(voiceData.clientName.toLowerCase()));
            if(matchingClient) setSelectedClient(matchingClient.id);
        }
        setDescription(voiceData.description);
        setAmount(String(voiceData.amount));
        setIsProforma(voiceData.invoiceType === 'proforma');
        setIssueDate(new Date().toISOString().split('T')[0]);
        setDueDate('');
    }
  }, [ocrData, suggestionData, voiceData, clients]);

  const handleBackClick = () => {
    playSound('click');
    setView('invoices');
  };
  
  const validateForm = (): boolean => {
      const newErrors = { selectedClient: '', amount: '', issueDate: '', dueDate: '' };
      let isValid = true;

      if (!selectedClient) {
          newErrors.selectedClient = 'Debes seleccionar un cliente.';
          isValid = false;
      }

      if (!amount || Number(amount) <= 0) {
          newErrors.amount = 'El importe debe ser un número positivo.';
          isValid = false;
      }

      if (!issueDate) {
          newErrors.issueDate = 'La fecha de emisión es obligatoria.';
          isValid = false;
      }

      if (dueDate && issueDate && new Date(dueDate) < new Date(issueDate)) {
          newErrors.dueDate = 'La fecha de vencimiento no puede ser anterior a la de emisión.';
          isValid = false;
      }
      
      setErrors(newErrors);
      return isValid;
  };

  const handleSendInvoice = () => {
      if (!validateForm()) {
          playSound('error');
          return;
      }
      playSound('success');
      const newInvoice: Invoice = {
          id: `inv-${Date.now()}`,
          invoiceNumber,
          clientName: clients.find(c => c.id === selectedClient)?.name || 'Cliente desconocido',
          issueDate: issueDate ? new Date(issueDate).toLocaleDateString('es-ES') : '',
          dueDate: dueDate ? new Date(dueDate).toLocaleDateString('es-ES') : '',
          amount: Number(amount),
          status: InvoiceStatus.Pending,
          category: 'Ingreso por Ventas',
          description,
          invoiceType: isProforma ? 'proforma' : 'official',
      };
      onInvoiceCreated(newInvoice);
  };

  const inputClasses = "w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500";
  const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  
  const totalAmount = (Number(amount) || 0) * (1 + (Number(taxRate) || 0) / 100);

  return (
    <div className="p-4 md:p-6">
        <div className="mb-6">
            <button onClick={handleBackClick} className="text-orange-500 dark:text-orange-400 mb-4 hover:underline">&lt; Volver a Facturas</button>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Nueva Factura</h2>
                    <p className="text-slate-500 dark:text-slate-400">Crea una nueva factura para tus clientes.</p>
                </div>
                 {isProforma && (
                    <span className="font-bold py-2 px-4 rounded-lg bg-blue-500/10 text-blue-500">
                        FACTURA PROFORMA
                    </span>
                )}
            </div>
        </div>
        
        {suggestionData && (
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-orange-500"/>
                <div>
                    <p className="font-semibold text-orange-800 dark:text-orange-300">Datos rellenados desde sugerencia de IA</p>
                    <p className="text-sm text-orange-700 dark:text-orange-400">Revisa la información antes de enviar.</p>
                </div>
            </div>
        )}
        
        {voiceData && (
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-orange-500"/>
                <div>
                    <p className="font-semibold text-orange-800 dark:text-orange-300">Datos generados por voz</p>
                    <p className="text-sm text-orange-700 dark:text-orange-400">Revisa la información antes de enviar.</p>
                </div>
            </div>
        )}
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Información Básica</h3>
            
            <div>
                <label htmlFor="invoiceNumber" className={labelClasses}>Número de Factura</label>
                <input
                    type="text"
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className={inputClasses}
                />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="issueDate" className={labelClasses}>Fecha de Emisión</label>
                    <input
                        type="date"
                        id="issueDate"
                        value={issueDate}
                        onChange={e => {
                           setIssueDate(e.target.value);
                           if (errors.issueDate) setErrors(prev => ({...prev, issueDate: ''}));
                        }}
                        className={`${inputClasses} ${errors.issueDate ? 'border-red-500' : ''}`}
                    />
                    {errors.issueDate && <p className="text-red-500 text-xs mt-1">{errors.issueDate}</p>}
                </div>
                <div>
                    <label htmlFor="dueDate" className={labelClasses}>Fecha de Vencimiento</label>
                    <input
                        type="date"
                        id="dueDate"
                        value={dueDate}
                        onChange={e => {
                            setDueDate(e.target.value);
                            if (errors.dueDate) setErrors(prev => ({...prev, dueDate: ''}));
                        }}
                        className={`${inputClasses} ${errors.dueDate ? 'border-red-500' : ''}`}
                    />
                    {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="client" className={labelClasses}>Cliente</label>
                <select
                    id="client"
                    value={selectedClient}
                    onChange={e => {
                        setSelectedClient(e.target.value);
                        if (errors.selectedClient) setErrors(prev => ({...prev, selectedClient: ''}));
                    }}
                    className={`${inputClasses} ${errors.selectedClient ? 'border-red-500' : ''}`}
                >
                    <option value="">Seleccionar cliente</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
                {errors.selectedClient && <p className="text-red-500 text-xs mt-1">{errors.selectedClient}</p>}
            </div>
            
             <div>
                <label htmlFor="description" className={labelClasses}>Concepto / Descripción</label>
                <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className={inputClasses}
                    placeholder="Ej: Diseño de logotipo y branding corporativo"
                />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="amount" className={labelClasses}>Importe Base (€)</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            if (errors.amount) setErrors(prev => ({...prev, amount: ''}));
                        }}
                        className={`${inputClasses} ${errors.amount ? 'border-red-500' : ''}`}
                        placeholder="0.00"
                    />
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                </div>
                <div>
                    <label htmlFor="taxRate" className={labelClasses}>Tipo de IVA (%)</label>
                    <input
                        type="number"
                        id="taxRate"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className={inputClasses}
                        placeholder="21"
                    />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-right">
                <p className="text-slate-500 dark:text-slate-400">Total Factura:</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    €{totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </div>
        
        <div className="flex gap-4 mt-8">
            <button onClick={() => playSound('click')} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-lg w-full transition-colors">
                Guardar Borrador
            </button>
            <button onClick={handleSendInvoice} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 transition-colors">
                <PaperAirplaneIcon className="w-5 h-5"/>
                Enviar Factura
            </button>
        </div>
    </div>
  );
};

export default NewInvoice;