import React, { useState, useMemo } from 'react';
import { View, ManagedAccount, TeamMember, TeamMemberRole } from '../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon, XIcon, UserIcon, MailIcon, LockClosedIcon } from './icons';
import { useSound } from '../hooks/useSound';

// Mock data to simulate backend
const mockAccounts: ManagedAccount[] = [
    { id: 'acc-1', name: 'Innovate Solutions S.L.' },
    { id: 'acc-2', name: 'García & Asociados Gestoría' },
    { id: 'acc-3', name: 'Creative Web Design' },
];

const mockTeamMembers: TeamMember[] = [
    { id: 'tm-1', name: 'Ana Martínez', email: 'ana.martinez@innovate.es', role: 'Admin', accountId: 'acc-1' },
    { id: 'tm-2', name: 'Carlos Pérez', email: 'carlos.perez@innovate.es', role: 'Contable', accountId: 'acc-1' },
    { id: 'tm-3', name: 'Lucía Fernández', email: 'lucia.f@garcia.es', role: 'Admin', accountId: 'acc-2' },
    { id: 'tm-4', name: 'Javier Gómez', email: 'javier.g@garcia.es', role: 'Asistente', accountId: 'acc-2' },
    { id: 'tm-5', name: 'Sofía Díaz', email: 'sofia@creative.es', role: 'Admin', accountId: 'acc-3' },
];

const MetricCard = ({ title, value, subtext }: { title: string, value: string, subtext: string }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtext}</p>
    </div>
);

const RoleBadge: React.FC<{ role: TeamMemberRole }> = ({ role }) => {
    const roleClasses = {
        'Admin': "bg-red-500/20 text-red-400",
        'Contable': "bg-blue-500/20 text-blue-400",
        'Asistente': "bg-yellow-500/20 text-yellow-400",
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${roleClasses[role]}`}>{role}</span>;
};

const AddMemberModal: React.FC<{ isOpen: boolean, onClose: () => void, onAdd: (member: Omit<TeamMember, 'id' | 'accountId'>) => void }> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<TeamMemberRole>('Asistente');
    const { playSound } = useSound();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        playSound('success');
        onAdd({ name, email, role });
        onClose();
    };

    const handleClose = () => {
        playSound('close');
        onClose();
    };
    
    const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
    const inputClasses = "w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200 dark:border-slate-600";


    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-200 dark:border-slate-700">
                <header className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">Añadir Miembro</h2>
                    <button onClick={handleClose}><XIcon className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className={labelClasses}>Nombre Completo</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                        </div>
                         <div>
                            <label htmlFor="email" className={labelClasses}>Email</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="role" className={labelClasses}>Rol</label>
                            <select id="role" value={role} onChange={e => setRole(e.target.value as TeamMemberRole)} className={inputClasses}>
                                <option>Asistente</option>
                                <option>Contable</option>
                                <option>Admin</option>
                            </select>
                        </div>
                    </main>
                    <footer className="p-4 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={handleClose} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold px-4 py-2 rounded-lg">Cancelar</button>
                        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg">Añadir Miembro</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


const MultiAccount: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { playSound } = useSound();
    const [accounts] = useState<ManagedAccount[]>(mockAccounts);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
    const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0].id);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const selectedAccount = useMemo(() => accounts.find(acc => acc.id === selectedAccountId), [accounts, selectedAccountId]);
    const filteredTeamMembers = useMemo(() => teamMembers.filter(tm => tm.accountId === selectedAccountId), [teamMembers, selectedAccountId]);
    
    const handleAddMember = (member: Omit<TeamMember, 'id' | 'accountId'>) => {
        const newMember: TeamMember = {
            id: `tm-${Math.random()}`,
            ...member,
            accountId: selectedAccountId,
        };
        setTeamMembers(prev => [...prev, newMember]);
    };

    const handleRemoveMember = (id: string) => {
        playSound('error');
        setTeamMembers(prev => prev.filter(tm => tm.id !== id));
    };
    
    const handleOpenModal = () => {
        playSound('open');
        setIsModalOpen(true);
    }

    return (
        <>
            <div className="p-4 md:p-6 space-y-6">
                <div>
                    <button onClick={() => setView('dashboard')} className="text-orange-500 dark:text-orange-400 mb-4 hover:underline flex items-center gap-1">
                        <ArrowLeftIcon className="w-4 h-4" /> Volver al Dashboard
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Panel Multi-Cuenta</h2>
                    <p className="text-slate-500 dark:text-slate-400">Gestiona todas tus cuentas de cliente desde un único lugar.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <label htmlFor="account-switcher" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cuenta Activa</label>
                    <select
                        id="account-switcher"
                        value={selectedAccountId}
                        onChange={e => setSelectedAccountId(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-lg font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200 dark:border-slate-600"
                    >
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Visión General (Todas las Cuentas)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <MetricCard title="Ingresos Consolidados" value="€125,430" subtext="Este año" />
                        <MetricCard title="Facturas Pendientes" value="€18,210" subtext="En 15 facturas" />
                        <MetricCard title="Cuentas Gestionadas" value={`${accounts.length}`} subtext="Clientes activos" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Equipo de: <span className="text-orange-500">{selectedAccount?.name}</span>
                        </h3>
                        <button onClick={handleOpenModal} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                            <PlusIcon className="w-5 h-5" />
                            Añadir Miembro
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-3">Nombre</th>
                                    <th className="p-3">Rol</th>
                                    <th className="p-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeamMembers.map(member => (
                                    <tr key={member.id} className="border-b border-slate-100 dark:border-slate-700">
                                        <td className="p-3">
                                            <p className="font-semibold">{member.name}</p>
                                            <p className="text-sm text-slate-500">{member.email}</p>
                                        </td>
                                        <td className="p-3"><RoleBadge role={member.role} /></td>
                                        <td className="p-3">
                                            <button onClick={() => handleRemoveMember(member.id)} className="text-slate-400 hover:text-red-500 p-1">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredTeamMembers.length === 0 && <p className="text-center p-6 text-slate-500">No hay miembros en esta cuenta.</p>}
                    </div>
                </div>
            </div>
            <AddMemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddMember}
            />
        </>
    );
};

export default MultiAccount;
