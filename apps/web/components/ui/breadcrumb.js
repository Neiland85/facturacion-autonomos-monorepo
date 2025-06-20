"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreadcrumbEllipsis = exports.BreadcrumbSeparator = exports.BreadcrumbPage = exports.BreadcrumbLink = exports.BreadcrumbItem = exports.BreadcrumbList = exports.Breadcrumb = void 0;
const React = require("react");
const react_slot_1 = require("@radix-ui/react-slot");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const Breadcrumb = React.forwardRef(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props}/>);
exports.Breadcrumb = Breadcrumb;
Breadcrumb.displayName = "Breadcrumb";
const BreadcrumbList = React.forwardRef(({ className, ...props }, ref) => (<ol ref={ref} className={(0, utils_1.cn)("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5", className)} {...props}/>));
exports.BreadcrumbList = BreadcrumbList;
BreadcrumbList.displayName = "BreadcrumbList";
const BreadcrumbItem = React.forwardRef(({ className, ...props }, ref) => (<li ref={ref} className={(0, utils_1.cn)("inline-flex items-center gap-1.5", className)} {...props}/>));
exports.BreadcrumbItem = BreadcrumbItem;
BreadcrumbItem.displayName = "BreadcrumbItem";
const BreadcrumbLink = React.forwardRef(({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? react_slot_1.Slot : "a";
    return (<Comp ref={ref} className={(0, utils_1.cn)("transition-colors hover:text-foreground", className)} {...props}/>);
});
exports.BreadcrumbLink = BreadcrumbLink;
BreadcrumbLink.displayName = "BreadcrumbLink";
const BreadcrumbPage = React.forwardRef(({ className, ...props }, ref) => (<span ref={ref} role="link" aria-disabled="true" aria-current="page" className={(0, utils_1.cn)("font-normal text-foreground", className)} {...props}/>));
exports.BreadcrumbPage = BreadcrumbPage;
BreadcrumbPage.displayName = "BreadcrumbPage";
const BreadcrumbSeparator = ({ children, className, ...props }) => (<li role="presentation" aria-hidden="true" className={(0, utils_1.cn)("[&>svg]:w-3.5 [&>svg]:h-3.5", className)} {...props}>
    {children ?? <lucide_react_1.ChevronRight />}
  </li>);
exports.BreadcrumbSeparator = BreadcrumbSeparator;
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
const BreadcrumbEllipsis = ({ className, ...props }) => (<span role="presentation" aria-hidden="true" className={(0, utils_1.cn)("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
    <span className="sr-only">More</span>
  </span>);
exports.BreadcrumbEllipsis = BreadcrumbEllipsis;
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";
