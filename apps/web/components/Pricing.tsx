import React, { useState } from 'react';
import { CheckCircleIcon } from './icons';
import { useSound } from '../hooks/useSound';
import SubscriptionModal from './SubscriptionModal';

interface PlanCardProps {
    name: string;
    price: string;
    description: string;
    features: string[];
    isFeatured?: boolean;
    onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ name, price, description, features, isFeatured, onSelect }) => {
    return (
        <div className={`p-8 rounded-2xl border h-full flex flex-col ${isFeatured ? 'border-orange-500 bg-slate-50 dark:bg-slate-800/50' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
            {isFeatured && <p className="text-center text-orange-500 font-semibold mb-4">Más Popular</p>}
            <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white">{name}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mt-2">{description}</p>
            <p className="text-5xl font-bold text-center text-slate-900 dark:text-white mt-6">
                {price}<span className="text-lg font-medium text-slate-500 dark:text-slate-400">/mes</span>
            </p>
            <ul className="mt-8 space-y-4 flex-grow">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                onClick={onSelect}
                className={`w-full mt-10 font-bold py-3 px-4 rounded-lg transition-colors ${
                    isFeatured
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500'
                }`}
            >
                {name === 'Básico' ? 'Continuar con Básico' : (isFeatured ? 'Comenzar Prueba Gratuita' : 'Seleccionar Plan')}
            </button>
        </div>
    );
};

interface PricingProps {
    onSubscribe: (plan: 'premium' | 'enterprise') => void;
}

const Pricing: React.FC<PricingProps> = ({ onSubscribe }) => {
    const { playSound } = useSound();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'premium' | 'enterprise' | null>(null);

    const plans = [
        {
            name: 'Básico',
            price: '€9',
            description: 'Ideal para autónomos que empiezan.',
            features: [
                'Hasta 20 facturas al mes',
                'Escaneo OCR (10/mes)',
                'Asistente IA (Básico)',
                'Análisis fiscal trimestral',
                'Soporte por email'
            ],
            isFeatured: false,
        },
        {
            name: 'Pro',
            price: '€58',
            description: 'Para negocios en crecimiento y PYMEs.',
            features: [
                'Facturas ilimitadas',
                'Escaneo OCR ilimitado',
                'Asistente IA (Avanzado)',
                'Presentación de modelos (Beta)',
                'Soporte prioritario por chat',
                'Integración con bancos'
            ],
            isFeatured: true,
        },
        {
            name: 'Empresa',
            price: '€385',
            description: 'Soluciones a medida para grandes empresas.',
            features: [
                'Todo lo del plan Pro',
                'Gestión de múltiples usuarios',
                'API de acceso',
                'Asesoramiento personalizado',
                'Soporte telefónico dedicado',
                'Informes avanzados'
            ],
            isFeatured: false,
        }
    ];

    const handleSelectPlan = (planName: string) => {
        playSound('click');
        if (planName.toLowerCase() === 'pro') {
            setSelectedPlan('premium');
            setIsModalOpen(true);
        } else if (planName.toLowerCase() === 'empresa') {
            setSelectedPlan('enterprise');
            setIsModalOpen(true);
        }
    };

    const handleConfirmSubscription = () => {
        if (selectedPlan) {
            onSubscribe(selectedPlan);
            setIsModalOpen(false);
            setSelectedPlan(null);
        }
    };

    return (
        <>
            <div className="p-4 md:p-6 lg:p-10">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Planes a tu Medida</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg">
                        Elige el plan que mejor se adapta a las necesidades de tu negocio. Sin contratos, cancela cuando quieras.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto items-stretch">
                    {plans.map(plan => (
                        <div key={plan.name}>
                            <PlanCard {...plan} onSelect={() => handleSelectPlan(plan.name)} />
                        </div>
                    ))}
                </div>
            </div>
            {selectedPlan && (
                <SubscriptionModal
                    isOpen={isModalOpen}
                    onClose={() => { playSound('close'); setIsModalOpen(false); }}
                    onConfirm={handleConfirmSubscription}
                    plan={selectedPlan}
                />
            )}
        </>
    );
};

export default Pricing;