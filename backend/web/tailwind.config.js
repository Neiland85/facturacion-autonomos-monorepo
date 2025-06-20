"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Use CSS variables for main palette, allowing themes to override
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Keep specific color definitions for direct use where needed
                sage: {
                    50: "#f6f7f6",
                    100: "#e3e7e3",
                    200: "#c7d0c7",
                    300: "#a1b0a1",
                    400: "#7a8e7a",
                    500: "#5d7261", // Primary sage
                    600: "#4a5b4e",
                    700: "#3d4a40",
                    800: "#333d36",
                    900: "#2c342f",
                    950: "#161a18",
                },
                terracotta: {
                    50: "#fdf6f3",
                    100: "#fae9e3",
                    200: "#f5d7cb",
                    300: "#edbca6",
                    400: "#e29b7a",
                    500: "#d67f54", // Primary terracotta
                    600: "#c8673f",
                    700: "#a75536",
                    800: "#874832",
                    900: "#6e3d2d",
                    950: "#3b1e16",
                },
                cream: {
                    50: "#fefdf9",
                    100: "#fefbf0",
                    200: "#fcf6de",
                    300: "#f9edc4",
                    400: "#f4dfa1",
                    500: "#edc775", // Primary cream
                    600: "#e3b055",
                    700: "#be8f3f",
                    800: "#9a7336",
                    900: "#7c5e2f",
                    950: "#443018",
                },
                slate: {
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                    300: "#cbd5e1",
                    400: "#94a3b8",
                    500: "#64748b",
                    600: "#475569",
                    700: "#334155",
                    800: "#1e293b",
                    900: "#0f172a",
                    950: "#020617",
                },
                petrol: {
                    // Keep petrol for specific uses if needed, or remove if fully replaced by themes
                    DEFAULT: "#005F73",
                    light: "#0A9396",
                    dark: "#003E4C",
                },
                chart: {
                    // Chart colors can also be theme-dependent
                    "1": "hsl(var(--chart-1))",
                    "2": "hsl(var(--chart-2))",
                    "3": "hsl(var(--chart-3))",
                    "4": "hsl(var(--chart-4))",
                    "5": "hsl(var(--chart-5))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: {
                        height: "0",
                    },
                    to: {
                        height: "var(--radix-accordion-content-height)",
                    },
                },
                "accordion-up": {
                    from: {
                        height: "var(--radix-accordion-content-height)",
                    },
                    to: {
                        height: "0",
                    },
                },
                "ocr-scan": {
                    "0%": {
                        transform: "scale(1)",
                        boxShadow: "0 0 0 0 rgba(93, 114, 97, 0.4)",
                    },
                    "70%": {
                        transform: "scale(1.05)",
                        boxShadow: "0 0 0 10px rgba(93, 114, 97, 0)",
                    },
                    "100%": {
                        transform: "scale(1)",
                        boxShadow: "0 0 0 0 rgba(93, 114, 97, 0)",
                    },
                },
                "scan-line": {
                    "0%": {
                        transform: "translateY(-100%)",
                        opacity: "1",
                    },
                    "100%": {
                        transform: "translateY(100vh)",
                        opacity: "0",
                    },
                },
                "pulse-glow": {
                    "0%, 100%": {
                        boxShadow: "0 0 5px rgba(93, 114, 97, 0.5)",
                    },
                    "50%": {
                        boxShadow: "0 0 20px rgba(93, 114, 97, 0.8), 0 0 30px rgba(93, 114, 97, 0.6)",
                    },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "ocr-scan": "ocr-scan 2s infinite",
                "scan-line": "scan-line 2s ease-in-out infinite",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
            },
            backgroundImage: {
                "paper-texture": 'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cdefs%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch"/%3E%3C/filter%3E%3C/defs%3E%3Crect width="100" height="100" filter="url(%23noiseFilter)" opacity="0.05"/%3E%3C/svg%3E\')',
                "subtle-grid": 'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"%3E%3Cpath d="M0 16h32M16 0v32" stroke="%23cbd5e1" stroke-width="0.5" opacity="0.3"/%3E%3C/svg%3E\')',
            },
            boxShadow: {
                soft: "0 2px 8px rgba(0, 0, 0, 0.06)",
                elegant: "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)",
                "ocr-active": "0 0 0 3px rgba(93, 114, 97, 0.2), 0 8px 25px rgba(93, 114, 97, 0.15)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
exports.default = config;
