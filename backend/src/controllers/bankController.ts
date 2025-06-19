import { Request, Response } from 'express';
import { getSantanderAccounts } from '../modules/banks/santander';
import { getBBVAAccounts } from '../modules/banks/bbva';
import { getCaixaBankAccounts } from '../modules/banks/caixabank';
import { getSabadellAccounts } from '../modules/banks/sabadell';
import { getBankinterAccounts } from '../modules/banks/bankinter';

// Ajustar tipos para cuentas bancarias
interface BankAccount {
  accountNumber: string;
  balance: number;
}

export const getBankAccounts = async (req: Request, res: Response) => {
  const { bank, accessToken } = req.body;

  if (!bank || !accessToken) {
    return res.status(400).json({ error: 'Banco o token de acceso no proporcionado.' });
  }

  try {
    let accounts;
    switch (bank.toLowerCase()) {
      case 'santander':
        accounts = await getSantanderAccounts(accessToken);
        break;
      case 'bbva':
        accounts = await getBBVAAccounts(accessToken);
        break;
      case 'caixabank':
        accounts = await getCaixaBankAccounts(accessToken);
        break;
      case 'sabadell':
        accounts = await getSabadellAccounts(accessToken);
        break;
      case 'bankinter':
        accounts = await getBankinterAccounts(accessToken);
        break;
      default:
        return res.status(400).json({ error: 'Banco no soportado.' });
    }

    res.json({ accounts });
  } catch (error) {
    console.error('Error al obtener cuentas bancarias:', error);
    res.status(500).json({ error: 'Error al obtener cuentas bancarias.' });
  }
};
