'use client';

import { useState } from 'react';
import Pricing from '../components/Pricing';
import SubscriptionModal from '../components/SubscriptionModal';
import { SubscriptionPlan } from '../types/subscription.types';

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [modalMode, setModalMode] = useState<
    'create' | 'cancel' | 'reactivate' | 'manage'
  >('create');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleManageSubscription = () => {
    setModalMode('manage');
    setIsModalOpen(true);
  };

  const handleCancelSubscription = () => {
    setModalMode('cancel');
    setIsModalOpen(true);
  };

  const handleReactivateSubscription = () => {
    setModalMode('reactivate');
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Suscripciones
              </h1>
              <p className="mt-2 text-gray-600">
                Gestiona tu suscripción y accede a todas las funciones premium
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleManageSubscription}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Administrar Suscripción
              </button>
              <button
                onClick={handleCancelSubscription}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Cancelar Suscripción
              </button>
              <button
                onClick={handleReactivateSubscription}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Reactivar Suscripción
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <Pricing onSelectPlan={handleSelectPlan} />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan || undefined}
        mode={modalMode}
      />

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 TributariApp. Todos los derechos reservados.</p>
            <p className="mt-2">
              Las suscripciones se renuevan automáticamente. Puedes cancelar en
              cualquier momento.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
