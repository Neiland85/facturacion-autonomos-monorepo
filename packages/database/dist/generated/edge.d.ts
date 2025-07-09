export const __esModule: boolean;
export namespace Prisma {
    let TransactionIsolationLevel: any;
    namespace UserScalarFieldEnum {
        let id: string;
        let email: string;
        let name: string;
        let createdAt: string;
        let updatedAt: string;
    }
    namespace CompanyScalarFieldEnum {
        let id_1: string;
        export { id_1 as id };
        let name_1: string;
        export { name_1 as name };
        export let cif: string;
        export let address: string;
        export let city: string;
        export let postalCode: string;
        export let province: string;
        export let phone: string;
        let email_1: string;
        export { email_1 as email };
        export let website: string;
        export let taxRegime: string;
        export let vatNumber: string;
        export let userId: string;
        let createdAt_1: string;
        export { createdAt_1 as createdAt };
        let updatedAt_1: string;
        export { updatedAt_1 as updatedAt };
    }
    namespace ClientScalarFieldEnum {
        let id_2: string;
        export { id_2 as id };
        let name_2: string;
        export { name_2 as name };
        export let nifCif: string;
        let address_1: string;
        export { address_1 as address };
        let city_1: string;
        export { city_1 as city };
        let postalCode_1: string;
        export { postalCode_1 as postalCode };
        let province_1: string;
        export { province_1 as province };
        let phone_1: string;
        export { phone_1 as phone };
        let email_2: string;
        export { email_2 as email };
        let userId_1: string;
        export { userId_1 as userId };
        let createdAt_2: string;
        export { createdAt_2 as createdAt };
        let updatedAt_2: string;
        export { updatedAt_2 as updatedAt };
    }
    namespace InvoiceScalarFieldEnum {
        let id_3: string;
        export { id_3 as id };
        export let number: string;
        export let series: string;
        export let issueDate: string;
        export let dueDate: string;
        export let subtotal: string;
        export let vatAmount: string;
        export let total: string;
        export let status: string;
        export let paidAt: string;
        export let siiSent: string;
        export let siiReference: string;
        export let siiSentAt: string;
        export let companyId: string;
        export let clientId: string;
        let userId_2: string;
        export { userId_2 as userId };
        export let notes: string;
        let createdAt_3: string;
        export { createdAt_3 as createdAt };
        let updatedAt_3: string;
        export { updatedAt_3 as updatedAt };
    }
    namespace InvoiceLineScalarFieldEnum {
        let id_4: string;
        export { id_4 as id };
        export let description: string;
        export let quantity: string;
        export let unitPrice: string;
        export let vatRate: string;
        export let amount: string;
        export let invoiceId: string;
    }
    namespace SortOrder {
        let asc: string;
        let desc: string;
    }
    namespace QueryMode {
        let _default: string;
        export { _default as default };
        export let insensitive: string;
    }
    namespace NullsOrder {
        let first: string;
        let last: string;
    }
    namespace ModelName {
        let User: string;
        let Company: string;
        let Client: string;
        let Invoice: string;
        let InvoiceLine: string;
    }
}
export namespace $Enums {
    namespace TaxRegime {
        let GENERAL: string;
        let SIMPLIFIED: string;
        let AGRICULTURE: string;
    }
    namespace InvoiceStatus {
        let DRAFT: string;
        let SENT: string;
        let PAID: string;
        let OVERDUE: string;
        let CANCELLED: string;
    }
}
export namespace TaxRegime {
    let GENERAL_1: string;
    export { GENERAL_1 as GENERAL };
    let SIMPLIFIED_1: string;
    export { SIMPLIFIED_1 as SIMPLIFIED };
    let AGRICULTURE_1: string;
    export { AGRICULTURE_1 as AGRICULTURE };
}
export namespace InvoiceStatus {
    let DRAFT_1: string;
    export { DRAFT_1 as DRAFT };
    let SENT_1: string;
    export { SENT_1 as SENT };
    let PAID_1: string;
    export { PAID_1 as PAID };
    let OVERDUE_1: string;
    export { OVERDUE_1 as OVERDUE };
    let CANCELLED_1: string;
    export { CANCELLED_1 as CANCELLED };
}
export namespace Prisma {
    export namespace prismaVersion {
        let client: string;
        let engine: string;
    }
    export { PrismaClientKnownRequestError };
    export { PrismaClientUnknownRequestError };
    export { PrismaClientRustPanicError };
    export { PrismaClientInitializationError };
    export { PrismaClientValidationError };
    export { Decimal };
    export { sqltag as sql };
    export { empty };
    export { join };
    export { raw };
    export let validator: any;
    export let getExtensionContext: any;
    export let defineExtension: any;
    export let DbNull: any;
    export let JsonNull: any;
    export let AnyNull: any;
    export namespace NullTypes {
        let DbNull_1: any;
        export { DbNull_1 as DbNull };
        let JsonNull_1: any;
        export { JsonNull_1 as JsonNull };
        let AnyNull_1: any;
        export { AnyNull_1 as AnyNull };
    }
}
export const PrismaClient: any;
import { PrismaClientKnownRequestError } from "./runtime/edge.js";
import { PrismaClientUnknownRequestError } from "./runtime/edge.js";
import { PrismaClientRustPanicError } from "./runtime/edge.js";
import { PrismaClientInitializationError } from "./runtime/edge.js";
import { PrismaClientValidationError } from "./runtime/edge.js";
import { Decimal } from "./runtime/edge.js";
import { sqltag } from "./runtime/edge.js";
import { empty } from "./runtime/edge.js";
import { join } from "./runtime/edge.js";
import { raw } from "./runtime/edge.js";
//# sourceMappingURL=edge.d.ts.map