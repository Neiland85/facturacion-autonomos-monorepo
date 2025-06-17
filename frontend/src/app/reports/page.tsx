export default function ReportsPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Reportes y Avisos Importantes</h1>
      <a href="/" style={{ color: 'blue' }}>← Volver al Inicio</a>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Reportes Clave</h2>
        <div style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0' }}>
          <h3>Informe de Ingresos Mensuales</h3>
          <p>Un resumen detallado de tus ingresos este mes.</p>
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Avisos y Notificaciones</h2>
        <div style={{ border: '1px solid red', padding: '15px', margin: '10px 0', backgroundColor: '#ffebee' }}>
          <h3>¡Alerta Urgente! Factura Vencida</h3>
          <p>Tienes facturas pendientes de revisión.</p>
        </div>
      </div>
    </div>
  );
}
