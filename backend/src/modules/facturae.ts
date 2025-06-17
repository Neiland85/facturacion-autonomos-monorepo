import { create } from 'xmlbuilder2';

export const generateFacturae = (invoiceData: any) => {
  const facturae = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('Facturae')
    .ele('Header')
    .ele('InvoiceNumber').txt(invoiceData.invoiceNumber).up()
    .ele('IssueDate').txt(invoiceData.issueDate).up()
    .up()
    .ele('Parties')
    .ele('Seller')
    .ele('Name').txt(invoiceData.sellerName).up()
    .up()
    .ele('Buyer')
    .ele('Name').txt(invoiceData.buyerName).up()
    .up()
    .up()
    .ele('Items');

  invoiceData.items.forEach((item: any) => {
    facturae.ele('Item')
      .ele('Description').txt(item.description).up()
      .ele('Quantity').txt(item.quantity).up()
      .ele('Price').txt(item.price).up()
      .up();
  });

  facturae.up().ele('Total').txt(invoiceData.total).up();

  return facturae.end({ prettyPrint: true });
};
