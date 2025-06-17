import { create } from 'xmlbuilder2';

export const generateUBL = (invoiceData: any) => {
  const ubl = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('Invoice')
    .ele('ID').txt(invoiceData.invoiceNumber).up()
    .ele('IssueDate').txt(invoiceData.issueDate).up()
    .ele('AccountingSupplierParty')
    .ele('Party')
    .ele('PartyName').txt(invoiceData.sellerName).up()
    .up()
    .up()
    .ele('AccountingCustomerParty')
    .ele('Party')
    .ele('PartyName').txt(invoiceData.buyerName).up()
    .up()
    .up()
    .ele('InvoiceLine');

  invoiceData.items.forEach((item: any) => {
    ubl.ele('Line')
      .ele('Description').txt(item.description).up()
      .ele('Quantity').txt(item.quantity).up()
      .ele('Price').txt(item.price).up()
      .up();
  });

  ubl.up().ele('LegalMonetaryTotal')
    .ele('PayableAmount').txt(invoiceData.total).up();

  return ubl.end({ prettyPrint: true });
};
