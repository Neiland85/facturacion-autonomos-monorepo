import React, { useState } from 'react';
import { useSound } from '../hooks/useSound';
import { findGrants } from '../services/geminiService';
import { Grant, SubscriptionTier, View } from '../types';
import { AwardIcon, SparklesIcon, DiamondIcon } from './icons';

interface GrantCardProps {
    grant: Grant;
    subscriptionTier: SubscriptionTier;
    isAutoApplying: boolean;
    onAutoApply: (grantName: string) => void;
}

const GrantCard: React.FC<GrantCardProps> = ({ grant, subscriptionTier, onAutoApply, isAutoApplying }) => {
    const isFreeTier = subscriptionTier === 'free';

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-semibold text-orange-500 uppercase">{grant.entity}</p>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{grant.name}</h3>
                </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{grant.description}</p>
            <div className="mt-4">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">Requisitos principales:</h4>
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500 dark:text-slate-400">
                    {grant.requirements.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                    href={grant.applicationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-block text-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Más Información
                </a>
                 <button
                    onClick={() => onAutoApply(grant.name)}
                    disabled={isAutoApplying}
                    className={`w-full inline-flex items-center justify-center gap-2 text-center font-bold py-2 px-4 rounded-lg transition-colors ${
                        isFreeTier 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-slate-400'
                    }`}
                >
                    <SparklesIcon className="w-5 h-5" />
                    {isAutoApplying ? 'Gestionando...' : (isFreeTier ? 'Gestionar (Pro)' : 'Gestionar con IA')}
                    {isFreeTier && <DiamondIcon className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};

interface GrantsProps {
    subscriptionTier: SubscriptionTier;
    setView: (view: View) => void;
}

const Grants: React.FC<GrantsProps> = ({ subscriptionTier, setView }) => {
    const { playSound } = useSound();
    const [entityType, setEntityType] = useState('Autónomo');
    const [sector, setSector] = useState('Tecnología y Digitalización');
    const [region, setRegion] = useState('Todas');
    const [grantType, setGrantType] = useState('Cualquiera');
    const [scope, setScope] = useState<'Ambos' | 'España' | 'Unión Europea'>('Ambos');
    const [grants, setGrants] = useState<Grant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [autoApplying, setAutoApplying] = useState<string | null>(null);

    const sectors = [
        'Tecnología y Digitalización',
        'Comercio Minorista',
        'Hostelería y Turismo',
        'Artesanía',
        'Transición Ecológica',
        'Consultoría y Servicios Profesionales',
    ];

    const regions = [
      'Todas', 'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias', 'Cantabria', 'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Ceuta', 'Comunidad Valenciana', 'Extremadura', 'Galicia', 'La Rioja', 'Madrid', 'Melilla', 'Murcia', 'Navarra', 'País Vasco'
    ];

    const grantTypes = [
        'Cualquiera', 'Digitalización', 'Contratación', 'Internacionalización', 'Creación de empresa', 'Sostenibilidad', 'I+D+i'
    ];

    const handleSearch = async () => {
        playSound('click');
        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        try {
            const results = await findGrants({ type: entityType, sector, region, grantType, scope });
            setGrants(results);
            playSound('success');
        } catch (err) {
            setError('Ha ocurrido un error al buscar subvenciones. Por favor, inténtalo de nuevo más tarde.');
            playSound('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoApply = (grantName: string) => {
        if (subscriptionTier === 'free') {
            playSound('error');
            setView('pricing');
            return;
        }
        playSound('success');
        setAutoApplying(grantName);
        setTimeout(() => {
            setAutoApplying(null);
        }, 3000); // Simulate processing time
    };

    const handleScopeChange = (newScope: typeof scope) => {
        setScope(newScope);
        if (newScope === 'Unión Europea') {
            setRegion('Todas'); // Reset region when it's not applicable for a clearer UX
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-10">
                    <SparklesIcon className="w-12 h-12 mx-auto text-slate-400 animate-pulse" />
                    <p className="mt-4 text-slate-500 dark:text-slate-400">Buscando las mejores ayudas para ti...</p>
                </div>
            );
        }
        if (error) {
            return <div className="text-center p-10 text-red-500 dark:text-red-400">{error}</div>;
        }
        if (!hasSearched) {
            return (
                <div className="text-center p-10 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl">
                    <AwardIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Encuentra ayudas para tu negocio</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Selecciona tu perfil y pulsa en "Buscar" para que nuestra IA encuentre las subvenciones más adecuadas para ti.</p>
                </div>
            );
        }
        if (grants.length > 0) {
            return (
                <div className="space-y-6">
                    {grants.map((grant, index) => (
                        <GrantCard 
                            key={index} 
                            grant={grant}
                            subscriptionTier={subscriptionTier}
                            onAutoApply={handleAutoApply}
                            isAutoApplying={autoApplying === grant.name}
                        />
                    ))}
                </div>
            );
        }
        return (
            <div className="text-center p-10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No se encontraron resultados</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">No hemos encontrado subvenciones activas para tu perfil. Intenta cambiar los filtros o vuelve a comprobarlo más tarde.</p>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Buscador de Subvenciones</h2>
                <p className="text-slate-500 dark:text-slate-400">Encuentra ayudas en España y Europa para tu negocio con la ayuda de la IA.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ámbito de la Búsqueda</label>
                    <div className="flex flex-wrap gap-2">
                        {(['Ambos', 'España', 'Unión Europea'] as const).map(s => (
                             <button 
                                key={s}
                                onClick={() => handleScopeChange(s)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${scope === s ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                             >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Soy un/una...</label>
                        <select
                            value={entityType}
                            onChange={(e) => setEntityType(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200 dark:border-slate-600"
                        >
                            <option>Autónomo</option>
                            <option>PYME</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mi sector es...</label>
                        <select
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200 dark:border-slate-600"
                        >
                            {sectors.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Comunidad Autónoma</label>
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            disabled={scope === 'Unión Europea'}
                            className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {regions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Ayuda</label>
                        <select
                            value={grantType}
                            onChange={(e) => setGrantType(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-200 dark:border-slate-600"
                        >
                            {grantTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600"
                >
                    <SparklesIcon className="w-5 h-5" />
                    {isLoading ? 'Buscando...' : 'Buscar con IA'}
                </button>
            </div>

            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default Grants;