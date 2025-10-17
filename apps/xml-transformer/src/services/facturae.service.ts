import { js2xml } from 'xml-js';

export class FacturaeService {
  /**
   * Genera XML Facturae 3.2.2 desde datos de factura
   * @param invoiceData - Los datos de la factura en formato JSON.
   * @returns Una cadena XML representando la factura.
   */
  public static generateFacturae(invoiceData: any): string {
    const xmlObject = {
      _declaration: { _attributes: { version: '1.0', encoding: 'UTF-8' } },
      'fe:Facturae': {
        _attributes: {
          'xmlns:fe': 'http://www.facturae.es/Facturae/2014/3.2.2/Facturae',
          'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
        },
        FileHeader: {
          SchemaVersion: { _text: '3.2.2' },
          Modality: { _text: 'I' },
          InvoiceIssuerType: { _text: 'EM' },
        },
        Parties: {
          SellerParty: FacturaeService.buildPartyXml(invoiceData.issuer),
          BuyerParty: FacturaeService.buildPartyXml(invoiceData.client),
        },
        Invoices: {
          Invoice: {
            InvoiceHeader: {
              InvoiceNumber: { _text: invoiceData.number },
              InvoiceIssueDate: {
                _text: new Date(invoiceData.date).toISOString().split('T')[0],
              },
              InvoiceCurrencyCode: { _text: 'EUR' },
            },
            InvoiceLines: {
              InvoiceLine: invoiceData.lines.map(FacturaeService.buildLineItemXml),
            },
            Totals: {
              TotalGrossAmount: { _text: invoiceData.subtotal.toFixed(2) },
              TotalTaxOutputs: {
                TaxOutput: [
                  {
                    TaxTypeCode: { _text: '01' }, // IVA
                    TaxRate: {
                      _text:
                        invoiceData.lines[0]?.vatRate.toFixed(2) ?? '21.00',
                    },
                    TaxableBase: {
                      TotalAmount: { _text: invoiceData.subtotal.toFixed(2) },
                    },
                    TaxAmount: {
                      TotalAmount: { _text: invoiceData.totalVat.toFixed(2) },
                    },
                  },
                ],
              },
              InvoiceTotal: { _text: invoiceData.total.toFixed(2) },
            },
            PaymentDetails: {
              Installment: {
                InstallmentDueDate: {
                  _text: new Date(invoiceData.dueDate)
                    .toISOString()
                    .split('T')[0],
                },
                InstallmentAmount: { _text: invoiceData.total.toFixed(2) },
                PaymentMeans: { _text: '04' }, // Transferencia bancaria
              },
            },
          },
        },
      },
    };

    return js2xml(xmlObject, { compact: true, spaces: 2 });
  }

  private static buildPartyXml(partyData: any) {
    return {
      TaxIdentification: {
        PersonTypeCode: { _text: 'J' },
        ResidenceTypeCode: { _text: 'R' },
        TaxIdentificationNumber: { _text: partyData.fiscalId },
      },
      LegalEntity: {
        CorporateName: { _text: partyData.name },
        AddressInSpain: {
          Address: { _text: partyData.address.street },
          PostCode: { _text: partyData.address.postalCode },
          Town: { _text: partyData.address.city },
          Province: { _text: partyData.address.province },
          CountryCode: { _text: 'ESP' },
        },
      },
    };
  }

  private static buildLineItemXml(item: any) {
    const subtotal = item.quantity * item.unitPrice;
    return {
      ItemDescription: { _text: item.description },
      Quantity: { _text: item.quantity.toFixed(2) },
      UnitOfMeasure: { _text: '01' },
      UnitPriceWithoutTax: { _text: item.unitPrice.toFixed(2) },
      TotalCost: { _text: subtotal.toFixed(2) },
      TaxesOutputs: {
        Tax: {
          TaxTypeCode: { _text: '01' }, // IVA
          TaxRate: { _text: item.vatRate.toFixed(2) },
          TaxableBase: { Amount: { _text: subtotal.toFixed(2) } },
          TaxAmount: { Amount: { _text: item.vatAmount.toFixed(2) } },
        },
      },
      GrossAmount: { _text: item.total.toFixed(2) },
    };
  }
}
