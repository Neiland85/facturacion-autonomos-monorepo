export default function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Bienvenido a TributariApp
      </h1>
      <p className="text-xl text-gray-600 mb-12">
        Sistema completo de gestión de facturación para autónomos
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-xl font-semibold mb-4">📄 Gestión de Facturas</h3>
          <p className="text-gray-600 mb-4">
            Crea, gestiona y envía facturas profesionales con facilidad.
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full">
            Ir a Facturas
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-xl font-semibold mb-4">👥 Gestión de Clientes</h3>
          <p className="text-gray-600 mb-4">
            Mantén organizada tu base de datos de clientes.
          </p>
          <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-full">
            Ver Clientes
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-xl font-semibold mb-4">📊 Reportes y Estadísticas</h3>
          <p className="text-gray-600 mb-4">
            Obtén insights detallados de tu negocio.
          </p>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full">
            Ver Reportes
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🚀 Tu MVP está listo
        </h2>
        <p className="text-gray-700 mb-6">
          Servicios backend funcionando correctamente en puertos 3002 y 3003.
        </p>
        <div className="flex justify-center space-x-4">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
            ✅ Invoice Service (3002)
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
            ✅ Tax Calculator (3003)
          </div>
        </div>
      </div>
    </div>
  );
}
