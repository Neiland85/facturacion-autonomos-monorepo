describe('Flujo de creación de facturas', () => {
  it('Permite al usuario crear y descargar una factura', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('usuario@example.com');
    cy.get('input[name="password"]').type('contraseña');
    cy.get('button[type="submit"]').click();
    cy.contains('Crear Factura').click();
    cy.get('input[name="cliente"]').type('Juan Pérez');
    cy.get('button[type="submit"]').click();
    cy.contains('Descargar PDF').click();
  });
});
