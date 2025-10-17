"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VoiceIntegrationExample;
var react_1 = require("react");
var button_1 = require("../ui/button");
var card_1 = require("../ui/card");
var voice_header_1 = require("../voice-header");
function VoiceIntegrationExample() {
    var _a = (0, react_1.useState)([]), invoices = _a[0], setInvoices = _a[1];
    var handleCreateInvoice = function (invoiceData) {
        var newInvoice = __assign(__assign({ id: Date.now().toString() }, invoiceData), { createdAt: new Date().toISOString() });
        setInvoices(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newInvoice], false); });
        console.log('Factura creada:', newInvoice);
    };
    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header con componentes de voz integrados */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                TributariApp
              </h1>
            </div>

            {/* Componente de voz integrado en el header */}
            <voice_header_1.default onCreateInvoice={handleCreateInvoice} className="flex items-center gap-2"/>

            <div className="flex items-center gap-2">
              <button_1.Button variant="outline" size="sm">
                Configuración
              </button_1.Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel de comandos de voz */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>🎤 Comandos de Voz Disponibles</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Comandos Globales</h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• "Ayuda" - Ver comandos disponibles</li>
                    <li>• "Crear factura" - Abrir creación de factura</li>
                    <li>• "Ver estadísticas" - Mostrar estadísticas</li>
                    <li>• "Configuración" - Abrir configuración</li>
                  </ul>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Crear Facturas</h4>
                  <ul className="text-sm text-green-700 mt-1 space-y-1">
                    <li>• "Factura de 100 euros por desarrollo web"</li>
                    <li>• "Crear factura de 50 euros por consultoría"</li>
                  </ul>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Lista de facturas creadas */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>📄 Facturas Creadas ({invoices.length})</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              {invoices.length === 0 ? (<p className="text-gray-500 text-center py-4">
                  No hay facturas creadas aún. Usa los comandos de voz para crear una.
                </p>) : (<div className="space-y-3">
                  {invoices.map(function (invoice) { return (<div key={invoice.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{invoice.description || 'Factura'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            €{invoice.amount || '0'}
                          </p>
                        </div>
                      </div>
                    </div>); })}
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Instrucciones de uso */}
        <card_1.Card className="mt-6">
          <card_1.CardHeader>
            <card_1.CardTitle>🚀 Cómo Usar</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">1. Comandos Globales</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Haz clic en el botón de micrófono (🎤) en el header para acceder a comandos globales.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <strong>Ejemplos:</strong>
                  <br />• Di "Ayuda" para ver comandos
                  <br />• Di "Crear factura" para abrir el modal de facturas
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. Crear Facturas por Voz</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Haz clic en el botón de documento (📄) para crear facturas directamente por voz.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <strong>Ejemplos:</strong>
                  <br />• "Factura de 100 euros por desarrollo web"
                  <br />• "Crear factura de 50 euros por consultoría"
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </main>
    </div>);
}
