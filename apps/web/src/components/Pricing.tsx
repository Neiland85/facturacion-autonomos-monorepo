'use client';

import { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../types/subscription.types';
import { subscriptionService } from '../services/subscription.service';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface PricingProps {
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  selectedPlanId?: string;
}

export default function Pricing({
  onSelectPlan,
  selectedPlanId,
}: PricingProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    loadSubscriptionPlans();
  }, []);

  const loadSubscriptionPlans = async () => {
    try {
      setLoading(true);
      const response = await subscriptionService.getSubscriptionPlans();
      if (response.success && response.data) {
        setPlans(response.data);
      } else {
        handleError(new Error(response.error ?? 'Error al cargar los planes'));
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    return (
      new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(price) + `/${interval === 'month' ? 'mes' : 'año'}`
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando planes...</span>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Planes de Suscripción
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-8">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-md p-8 ${
                plan.isPopular ? 'ring-2 ring-blue-500' : ''
              } ${selectedPlanId === plan.id ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <span className="inline-flex rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price, plan.currency, plan.interval)}
                  </span>
                </div>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-center">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-gray-700">
                      Hasta {plan.maxInvoices} facturas
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-gray-700">
                      Hasta {plan.maxClients} clientes
                    </span>
                  </li>
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-3 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelectPlan?.(plan)}
                  className={`mt-8 w-full py-3 px-6 rounded-md font-semibold transition-colors ${
                    selectedPlanId === plan.id
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : plan.isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlanId === plan.id
                    ? 'Seleccionado'
                    : 'Seleccionar Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
