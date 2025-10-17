interface NavItem {
    href: string;
    label: string;
    icon?: React.ComponentType<{
        className?: string;
    }>;
    badge?: string | number;
    onClick?: () => void;
}
interface NavigationProps {
    items: NavItem[];
    activePath?: string;
    onNavigate?: (href: string) => void;
    className?: string;
}
export declare function Navigation({ items, activePath, onNavigate, className }: NavigationProps): import("react").JSX.Element;
interface MobileNavigationProps {
    items: NavItem[];
    activePath?: string;
    onNavigate?: (href: string) => void;
    trigger?: React.ReactNode;
}
export declare function MobileNavigation({ items, activePath, onNavigate, trigger }: MobileNavigationProps): import("react").JSX.Element;
interface BreadcrumbItem {
    label: string;
    href?: string;
    onClick?: () => void;
}
interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    className?: string;
}
export declare function Breadcrumbs({ items, separator, className }: BreadcrumbsProps): import("react").JSX.Element;
interface TabItem {
    id: string;
    label: string;
    icon?: React.ComponentType<{
        className?: string;
    }>;
    badge?: string | number;
}
interface TabsProps {
    items: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}
export declare function Tabs({ items, activeTab, onTabChange, className }: TabsProps): import("react").JSX.Element;
export {};
