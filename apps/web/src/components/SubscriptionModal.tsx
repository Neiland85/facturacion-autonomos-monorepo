'use client';

import { useState, useEffect } from 'react';
import {
  Subscription,
  SubscriptionPlan,
  CreateSubscriptionRequest,
  CancelSubscriptionRequest,
} from '../types/subscription.types';
import { subscriptionService } from '../services/subscription.service';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan;
  mode: 'create' | 'cancel' | 'reactivate' | 'manage';
  currentSubscription?: Subscription | null;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  plan,
  mode,
  currentSubscription,
}: SubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [cancelImmediate, setCancelImmediate] = useState(false);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (isOpen) {
      setSuccess(null);
      setCancelImmediate(false);
    }
  }, [isOpen]);

  const handleCreateSubscription = async () => {
    if (!plan) return;

    try {
      setLoading(true);

      const request: CreateSubscriptionRequest = {
        planId: plan.id,
      };

      const response = await subscriptionService.createSubscription(request);

      if (response.success && response.data) {
        setSuccess('¡Suscripción creada exitosamente!');
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh to show updated subscription status
        }, 2000);
      } else {
        handleError(
          new Error(response.error || 'Error al crear la suscripción')
        );
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      setLoading(true);

      const request: CancelSubscriptionRequest = {
        immediate: cancelImmediate,
      };

      const response = await subscriptionService.cancelSubscription(
        currentSubscription.id,
        request
      );

      if (response.success && response.data) {
        setSuccess(
          cancelImmediate
            ? 'Suscripción cancelada inmediatamente'
            : 'Suscripción programada para cancelarse al final del período'
        );
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000);
      } else {
        handleError(
          new Error(response.error || 'Error al cancelar la suscripción')
        );
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!currentSubscription) return;

    try {
      setLoading(true);

      const response = await subscriptionService.reactivateSubscription(
        currentSubscription.id
      );

      if (response.success && response.data) {
        setSuccess('¡Suscripción reactivada exitosamente!');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000);
      } else {
        handleError(
          new Error(response.error || 'Error al reactivar la suscripción')
        );
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return `Suscribirse a ${plan?.name}`;
      case 'cancel':
        return 'Cancelar Suscripción';
      case 'reactivate':
        return 'Reactivar Suscripción';
      case 'manage':
        return 'Administrar Suscripción';
      default:
        return 'Suscripción';
    }
  };

  const getModalContent = () => {
    switch (mode) {
      case 'create':
        return plan ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">{plan.name}</h3>
              <p className="text-blue-700">{plan.description}</p>
              <div className="mt-2 text-lg font-bold text-blue-900">
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: plan.currency.toUpperCase(),
                }).format(plan.price)}
                /{plan.interval === 'month' ? 'mes' : 'año'}
              </div>
            </div>
            <p className="text-gray-600">
              Al confirmar, se creará tu suscripción inmediatamente. Podrás
              cancelarla en cualquier momento.
            </p>
          </div>
        ) : null;

      case 'cancel':
        return (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900">
                ¿Estás seguro de que quieres cancelar tu suscripción?
              </h3>
              <p className="text-red-700 mt-2">
                Perderás acceso a las funciones premium al final del período de
                facturación actual.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="cancelType"
                  checked={!cancelImmediate}
                  onChange={() => setCancelImmediate(false)}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-gray-700">
                  Cancelar al final del período actual (recomendado)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="cancelType"
                  checked={cancelImmediate}
                  onChange={() => setCancelImmediate(true)}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-gray-700">
                  Cancelar inmediatamente
                </span>
              </label>
            </div>
          </div>
        );

      case 'reactivate':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">
                Reactivar Suscripción
              </h3>
              <p className="text-green-700 mt-2">
                Tu suscripción se reactivará inmediatamente y podrás volver a
                disfrutar de todas las funciones premium.
              </p>
            </div>
          </div>
        );

      case 'manage':
        return currentSubscription ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">
                Estado de tu Suscripción
              </h3>
              <div className="mt-2 space-y-2">
                <p>
                  <strong>Plan:</strong> {currentSubscription.plan.name}
                </p>
                <p>
                  <strong>Estado:</strong>{' '}
                  {currentSubscription.status === 'active'
                    ? 'Activa'
                    : currentSubscription.status === 'canceled'
                      ? 'Cancelada'
                      : currentSubscription.status === 'past_due'
                        ? 'Vencida'
                        : 'Incompleta'}
                </p>
                <p>
                  <strong>Próxima facturación:</strong>{' '}
                  {new Date(
                    currentSubscription.currentPeriodEnd
                  ).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              {currentSubscription.status === 'canceled' && (
                <button
                  onClick={() => handleReactivateSubscription()}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Reactivar
                </button>
              )}
              {currentSubscription.status === 'active' && (
                <button
                  onClick={() => {
                    /* Switch to cancel mode */
                  }}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No tienes una suscripción activa.</p>
        );

      default:
        return null;
    }
  };

  const getActionButton = () => {
    const baseClasses =
      'w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50';

    switch (mode) {
      case 'create':
        return (
          <button
            onClick={handleCreateSubscription}
            disabled={loading || !plan}
            className={baseClasses}
          >
            {loading ? 'Creando...' : 'Confirmar Suscripción'}
          </button>
        );

      case 'cancel':
        return (
          <button
            onClick={handleCancelSubscription}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
          </button>
        );

      case 'reactivate':
        return (
          <button
            onClick={handleReactivateSubscription}
            disabled={loading}
            className={baseClasses}
          >
            {loading ? 'Reactivando...' : 'Reactivar Suscripción'}
          </button>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="mb-6">{getModalContent()}</div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            {mode === 'manage' ? 'Cerrar' : 'Cancelar'}
          </button>

          {getActionButton()}
        </div>
      </div>
    </div>
  );
}
