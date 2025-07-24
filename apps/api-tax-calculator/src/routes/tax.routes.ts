import type { TaxCalculationRequest, TaxCalculationResponse } from '@facturacion/types';
import { Router } from 'express';

const router = Router();

/**
 * Calcular impuestos de una factura
 */
router.post('/calculate', async (req, res) => {
  try {
    const taxRequest: TaxCalculationRequest = req.body;

    if (!taxRequest.amount || !taxRequest.vatRate) {
      return res.status(400).json({
        error: 'Amount and VAT rate are required',
        success: false,
      });
    }

    const vatAmount = taxRequest.amount * (taxRequest.vatRate / 100);
    const totalAmount = taxRequest.amount + vatAmount;

    const response: TaxCalculationResponse = {
      baseAmount: taxRequest.amount,
      vatRate: taxRequest.vatRate,
      vatAmount,
      totalAmount,
      retentionAmount: taxRequest.retentionRate 
        ? taxRequest.amount * (taxRequest.retentionRate / 100) 
        : 0,
      netAmount: totalAmount - (taxRequest.retentionRate 
        ? taxRequest.amount * (taxRequest.retentionRate / 100) 
        : 0),
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error calculating tax:', error);
    res.status(500).json({
      error: 'Internal server error',
      success: false,
    });
  }
});

/**
 * Obtener tipos de impuestos disponibles
 */
router.get('/types', (req, res) => {
  const taxTypes = [
    { id: 'iva_21', name: 'IVA General', rate: 21 },
    { id: 'iva_10', name: 'IVA Reducido', rate: 10 },
    { id: 'iva_4', name: 'IVA Superreducido', rate: 4 },
    { id: 'iva_0', name: 'IVA Exento', rate: 0 },
  ];

  res.json({
    success: true,
    data: taxTypes,
  });
});

/**
 * Validar cálculos fiscales
 */
router.post('/validate', (req, res) => {
  try {
    const { amount, vatRate, expectedTotal } = req.body;

    if (!amount || !vatRate || !expectedTotal) {
      return res.status(400).json({
        error: 'Amount, VAT rate, and expected total are required',
        success: false,
      });
    }

    const calculatedVat = amount * (vatRate / 100);
    const calculatedTotal = amount + calculatedVat;
    const isValid = Math.abs(calculatedTotal - expectedTotal) < 0.01;

    res.json({
      success: true,
      data: {
        isValid,
        calculatedTotal,
        expectedTotal,
        difference: Math.abs(calculatedTotal - expectedTotal),
      },
    });
  } catch (error) {
    console.error('Error validating tax calculation:', error);
    res.status(500).json({
      error: 'Internal server error',
      success: false,
    });
  }
});

export { router as taxRoutes };
