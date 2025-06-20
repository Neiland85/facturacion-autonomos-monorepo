"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationPrevious = exports.PaginationNext = exports.PaginationLink = exports.PaginationItem = exports.PaginationEllipsis = exports.PaginationContent = exports.Pagination = void 0;
const React = require("react");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/button");
const Pagination = ({ className, ...props }) => (<nav role="navigation" aria-label="pagination" className={(0, utils_1.cn)("mx-auto flex w-full justify-center", className)} {...props}/>);
exports.Pagination = Pagination;
Pagination.displayName = "Pagination";
const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (<ul ref={ref} className={(0, utils_1.cn)("flex flex-row items-center gap-1", className)} {...props}/>));
exports.PaginationContent = PaginationContent;
PaginationContent.displayName = "PaginationContent";
const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (<li ref={ref} className={(0, utils_1.cn)("", className)} {...props}/>));
exports.PaginationItem = PaginationItem;
PaginationItem.displayName = "PaginationItem";
const PaginationLink = ({ className, isActive, size = "icon", ...props }) => (<a aria-current={isActive ? "page" : undefined} className={(0, utils_1.cn)((0, button_1.buttonVariants)({
        variant: isActive ? "outline" : "ghost",
        size,
    }), className)} {...props}/>);
exports.PaginationLink = PaginationLink;
PaginationLink.displayName = "PaginationLink";
const PaginationPrevious = ({ className, ...props }) => (<PaginationLink aria-label="Go to previous page" size="default" className={(0, utils_1.cn)("gap-1 pl-2.5", className)} {...props}>
    <lucide_react_1.ChevronLeft className="h-4 w-4"/>
    <span>Previous</span>
  </PaginationLink>);
exports.PaginationPrevious = PaginationPrevious;
PaginationPrevious.displayName = "PaginationPrevious";
const PaginationNext = ({ className, ...props }) => (<PaginationLink aria-label="Go to next page" size="default" className={(0, utils_1.cn)("gap-1 pr-2.5", className)} {...props}>
    <span>Next</span>
    <lucide_react_1.ChevronRight className="h-4 w-4"/>
  </PaginationLink>);
exports.PaginationNext = PaginationNext;
PaginationNext.displayName = "PaginationNext";
const PaginationEllipsis = ({ className, ...props }) => (<span aria-hidden className={(0, utils_1.cn)("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
    <span className="sr-only">More pages</span>
  </span>);
exports.PaginationEllipsis = PaginationEllipsis;
PaginationEllipsis.displayName = "PaginationEllipsis";
