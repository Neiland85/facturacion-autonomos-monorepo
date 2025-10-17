"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceActions = InvoiceActions;
exports.QuickActions = QuickActions;
exports.InvoiceStats = InvoiceStats;
var framer_motion_1 = require("framer-motion");
var react_1 = require("react");
var button_1 = require("../ui/button");
var card_1 = require("../ui/card");
// Iconos personalizados
var PlusIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
  </svg>);
};
var SendIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
  </svg>);
};
var DownloadIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>);
};
var EyeIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>);
};
var EditIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>);
};
var TrashIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
  </svg>);
};
var MoreIcon = function (_a) {
    var className = _a.className;
    return (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
  </svg>);
};
function InvoiceActions(_a) {
    var _this = this;
    var invoiceId = _a.invoiceId, invoiceStatus = _a.invoiceStatus, onView = _a.onView, onEdit = _a.onEdit, onDelete = _a.onDelete, onSend = _a.onSend, onDownload = _a.onDownload, onDuplicate = _a.onDuplicate, _b = _a.className, className = _b === void 0 ? "" : _b;
    var _c = (0, react_1.useState)(false), isDeleting = _c[0], setIsDeleting = _c[1];
    var _d = (0, react_1.useState)(false), showMoreActions = _d[0], setShowMoreActions = _d[1];
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm("¿Estás seguro de que quieres eliminar esta factura?")) return [3 /*break*/, 4];
                    setIsDeleting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, (onDelete === null || onDelete === void 0 ? void 0 : onDelete(invoiceId))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsDeleting(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var canEdit = invoiceStatus === "draft";
    var canSend = invoiceStatus === "draft";
    var canDelete = invoiceStatus === "draft";
    return (<div className={"flex items-center gap-2 ".concat(className)}>
      {/* Acciones principales */}
      {onView && (<button_1.Button variant="outline" size="sm" onClick={function () { return onView(invoiceId); }} title="Ver factura">
          <EyeIcon className="w-4 h-4"/>
        </button_1.Button>)}

      {onEdit && canEdit && (<button_1.Button variant="outline" size="sm" onClick={function () { return onEdit(invoiceId); }} title="Editar factura">
          <EditIcon className="w-4 h-4"/>
        </button_1.Button>)}

      {onSend && canSend && (<button_1.Button variant="default" size="sm" onClick={function () { return onSend(invoiceId); }} title="Enviar factura">
          <SendIcon className="w-4 h-4"/>
        </button_1.Button>)}

      {onDownload && (<button_1.Button variant="outline" size="sm" onClick={function () { return onDownload(invoiceId); }} title="Descargar PDF">
          <DownloadIcon className="w-4 h-4"/>
        </button_1.Button>)}

      {/* Menú de acciones adicionales simple */}
      {(onDuplicate || onDelete) && (<div className="relative">
          <button_1.Button variant="outline" size="sm" onClick={function () { return setShowMoreActions(!showMoreActions); }} title="Más acciones">
            <MoreIcon className="w-4 h-4"/>
          </button_1.Button>

          <framer_motion_1.AnimatePresence>
            {showMoreActions && (<framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="py-1">
                  {onDuplicate && (<button onClick={function () {
                        onDuplicate(invoiceId);
                        setShowMoreActions(false);
                    }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <PlusIcon className="w-4 h-4 mr-2"/>
                      Duplicar factura
                    </button>)}

                  {onDownload && (<button onClick={function () {
                        onDownload(invoiceId);
                        setShowMoreActions(false);
                    }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <DownloadIcon className="w-4 h-4 mr-2"/>
                      Descargar PDF
                    </button>)}

                  {onDelete && canDelete && (<button onClick={function () {
                        handleDelete();
                        setShowMoreActions(false);
                    }} disabled={isDeleting} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
                      <TrashIcon className="w-4 h-4 mr-2"/>
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </button>)}
                </div>
              </framer_motion_1.motion.div>)}
          </framer_motion_1.AnimatePresence>
        </div>)}
    </div>);
}
function QuickActions(_a) {
    var onNewInvoice = _a.onNewInvoice, onNewClient = _a.onNewClient, onImport = _a.onImport, onExport = _a.onExport, _b = _a.className, className = _b === void 0 ? "" : _b;
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-lg">Acciones Rápidas</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="grid grid-cols-2 gap-3">
          {onNewInvoice && (<framer_motion_1.motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button_1.Button onClick={onNewInvoice} className="w-full h-20 flex-col gap-2" variant="default">
                <PlusIcon className="w-6 h-6"/>
                Nueva Factura
              </button_1.Button>
            </framer_motion_1.motion.div>)}

          {onNewClient && (<framer_motion_1.motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button_1.Button onClick={onNewClient} className="w-full h-20 flex-col gap-2" variant="outline">
                <PlusIcon className="w-6 h-6"/>
                Nuevo Cliente
              </button_1.Button>
            </framer_motion_1.motion.div>)}

          {onImport && (<framer_motion_1.motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button_1.Button onClick={onImport} className="w-full h-20 flex-col gap-2" variant="outline">
                <DownloadIcon className="w-6 h-6"/>
                Importar
              </button_1.Button>
            </framer_motion_1.motion.div>)}

          {onExport && (<framer_motion_1.motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button_1.Button onClick={onExport} className="w-full h-20 flex-col gap-2" variant="outline">
                <SendIcon className="w-6 h-6"/>
                Exportar
              </button_1.Button>
            </framer_motion_1.motion.div>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
function InvoiceStats(_a) {
    var totalInvoices = _a.totalInvoices, totalAmount = _a.totalAmount, pendingAmount = _a.pendingAmount, overdueAmount = _a.overdueAmount, _b = _a.className, className = _b === void 0 ? "" : _b;
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
        }).format(amount);
    };
    var stats = [
        {
            label: "Total Facturas",
            value: totalInvoices.toString(),
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            label: "Ingresos Totales",
            value: formatCurrency(totalAmount),
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            label: "Pendiente Cobro",
            value: formatCurrency(pendingAmount),
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            label: "Facturas Vencidas",
            value: formatCurrency(overdueAmount),
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
    ];
    return (<div className={"grid grid-cols-2 md:grid-cols-4 gap-4 ".concat(className)}>
      {stats.map(function (stat, index) { return (<framer_motion_1.motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
          <card_1.Card className={"".concat(stat.bgColor, " border-0")}>
            <card_1.CardContent className="p-4">
              <div className="text-2xl font-bold mb-1">
                <span className={stat.color}>{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </card_1.CardContent>
          </card_1.Card>
        </framer_motion_1.motion.div>); })}
    </div>);
}
