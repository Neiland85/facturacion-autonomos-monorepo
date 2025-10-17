"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceStatusBadge = InvoiceStatusBadge;
exports.PaymentStatusBadge = PaymentStatusBadge;
exports.InvoiceCard = InvoiceCard;
exports.ClientCard = ClientCard;
var framer_motion_1 = require("framer-motion");
var badge_1 = require("../ui/badge");
var button_1 = require("../ui/button");
var card_1 = require("../ui/card");
// Iconos personalizados
var FileTextIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>);
};
var UserIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>);
};
var EuroIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3h3m-3 3h3m6-11a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>);
};
var CalendarIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>);
};
var statusColors = {
    draft: "bg-gray-100 text-gray-800 border-gray-200",
    sent: "bg-blue-100 text-blue-800 border-blue-200",
    paid: "bg-green-100 text-green-800 border-green-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};
var paymentStatusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    paid: "bg-green-100 text-green-800 border-green-200",
    partial: "bg-orange-100 text-orange-800 border-orange-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
};
function InvoiceStatusBadge(_a) {
    var status = _a.status;
    var labels = {
        draft: "Borrador",
        sent: "Enviada",
        paid: "Pagada",
        overdue: "Vencida",
        cancelled: "Cancelada",
    };
    return (<badge_1.Badge variant="outline" className={statusColors[status]}>
      {labels[status]}
    </badge_1.Badge>);
}
function PaymentStatusBadge(_a) {
    var status = _a.status;
    var labels = {
        pending: "Pendiente",
        paid: "Pagado",
        partial: "Parcial",
        overdue: "Vencido",
    };
    return (<badge_1.Badge variant="outline" className={paymentStatusColors[status]}>
      {labels[status]}
    </badge_1.Badge>);
}
function InvoiceCard(_a) {
    var invoice = _a.invoice, onView = _a.onView, onEdit = _a.onEdit, onDelete = _a.onDelete, onSend = _a.onSend, _b = _a.className, className = _b === void 0 ? "" : _b;
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };
    var isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid';
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <card_1.Card className={"cursor-pointer transition-shadow hover:shadow-md ".concat(className)}>
        <card_1.CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileTextIcon className="w-5 h-5 text-blue-600"/>
              </div>
              <div>
                <card_1.CardTitle className="text-lg">{invoice.number}</card_1.CardTitle>
                <p className="text-sm text-muted-foreground">{invoice.client}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(invoice.amount)}
              </p>
            </div>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent className="pt-0">
          <div className="space-y-3">
            {/* Estados */}
            <div className="flex flex-wrap gap-2">
              <InvoiceStatusBadge status={invoice.status}/>
              <PaymentStatusBadge status={invoice.paymentStatus}/>
              {isOverdue && (<badge_1.Badge variant="destructive" className="text-xs">
                  Vencida
                </badge_1.Badge>)}
            </div>

            {/* Fechas */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4"/>
                <span>Emisión: {formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4"/>
                <span>Vence: {formatDate(invoice.dueDate)}</span>
              </div>
            </div>

            {/* Descripción */}
            {invoice.description && (<p className="text-sm text-muted-foreground line-clamp-2">
                {invoice.description}
              </p>)}

            {/* Acciones */}
            <div className="flex gap-2 pt-2">
              {onView && (<button_1.Button variant="outline" size="sm" onClick={function (e) {
                e.stopPropagation();
                onView(invoice);
            }}>
                  Ver
                </button_1.Button>)}
              {onEdit && invoice.status === 'draft' && (<button_1.Button variant="outline" size="sm" onClick={function (e) {
                e.stopPropagation();
                onEdit(invoice);
            }}>
                  Editar
                </button_1.Button>)}
              {onSend && invoice.status === 'draft' && (<button_1.Button variant="default" size="sm" onClick={function (e) {
                e.stopPropagation();
                onSend(invoice);
            }}>
                  Enviar
                </button_1.Button>)}
              {onDelete && invoice.status === 'draft' && (<button_1.Button variant="destructive" size="sm" onClick={function (e) {
                e.stopPropagation();
                onDelete(invoice);
            }}>
                  Eliminar
                </button_1.Button>)}
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </framer_motion_1.motion.div>);
}
function ClientCard(_a) {
    var client = _a.client, onView = _a.onView, onEdit = _a.onEdit, onCreateInvoice = _a.onCreateInvoice, _b = _a.className, className = _b === void 0 ? "" : _b;
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <card_1.Card className={"cursor-pointer transition-shadow hover:shadow-md ".concat(className)}>
        <card_1.CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserIcon className="w-5 h-5 text-green-600"/>
              </div>
              <div>
                <card_1.CardTitle className="text-lg">{client.name}</card_1.CardTitle>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
            </div>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent className="pt-0">
          <div className="space-y-3">
            {/* Información de contacto */}
            {client.phone && (<p className="text-sm text-muted-foreground">
                📞 {client.phone}
              </p>)}

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {client.totalInvoices}
                </p>
                <p className="text-xs text-muted-foreground">Facturas</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(client.totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-orange-600">
                  {formatCurrency(client.outstandingAmount)}
                </p>
                <p className="text-xs text-muted-foreground">Pendiente</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-2">
              {onView && (<button_1.Button variant="outline" size="sm" onClick={function (e) {
                e.stopPropagation();
                onView(client);
            }}>
                  Ver
                </button_1.Button>)}
              {onEdit && (<button_1.Button variant="outline" size="sm" onClick={function (e) {
                e.stopPropagation();
                onEdit(client);
            }}>
                  Editar
                </button_1.Button>)}
              {onCreateInvoice && (<button_1.Button variant="default" size="sm" onClick={function (e) {
                e.stopPropagation();
                onCreateInvoice(client);
            }}>
                  Nueva Factura
                </button_1.Button>)}
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </framer_motion_1.motion.div>);
}
