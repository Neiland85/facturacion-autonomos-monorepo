import React from 'react';
import './Reports.css';

const Reports = () => {
  const reports = [
    { id: 1, title: 'Reporte de Gastos Trimestrales', description: 'Recomendaciones para optimizar tus gastos.' },
    { id: 2, title: 'Reporte de Facturación', description: 'Análisis de tus ingresos y facturas pendientes.' },
  ];

  return (
    <div className="reports-container">
      <h1>Reportes Generados</h1>
      <p className="reports-message">Sigue las recomendaciones del bot para alcanzar la luz al final del túnel.</p>
      <div className="reports-list">
        {reports.map((report) => (
          <div key={report.id} className="report-card">
            <h2>{report.title}</h2>
            <p>{report.description}</p>
            <button>Ver Detalles</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
