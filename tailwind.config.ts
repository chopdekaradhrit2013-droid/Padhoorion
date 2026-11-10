import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          light: "#d97757",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          hover: "#dfdbd0",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        // Claude Remix Brand Palette (@priyalove920)
        brand: {
          50: "#fdf8f6",
          100: "#fbf0eb",
          200: "#f7dfd4",
          300: "#efc4b2",
          400: "#e39d81",
          500: "#c96442", // Primary Claude Terracotta
          600: "#b05536", // Hover Terracotta
          700: "#94442a",
          800: "#7b3a26",
          900: "#653223",
        },
        // Alias indigo to Claude Terracotta brand for full component compatibility
        indigo: {
          50: "#fdf8f6",
          100: "#fbf0eb",
          200: "#f7dfd4",
          300: "#efc4b2",
          400: "#e39d81",
          500: "#c96442",
          600: "#c96442",
          700: "#b05536",
          800: "#94442a",
          900: "#653223",
        },
        // Alias slate to Claude Remix warm paper neutrals
        slate: {
          50: "#faf9f5",
          100: "#f5f4ee",
          200: "#dad9d4",
          300: "#ceccc3",
          400: "#b4b2a7",
          500: "#83827d",
          600: "#696761",
          700: "#535146",
          800: "#3d3929",
          900: "#141413",
        },
        claude: {
          canvas: "#faf9f5",
          ink: "#3d3929",
          terracotta: "#c96442",
          hover: "#b05536",
          stone: "#e9e6dc",
          cream: "#ede9de",
          border: "#dad9d4",
          muted: "#83827d",
          sidebar: "#f5f4ee",
        },
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
        display: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        claude: "0 1px 3px 0 rgba(40, 38, 27, 0.05), 0 1px 2px -1px rgba(40, 38, 27, 0.04)",
        "claude-md": "0 4px 6px -1px rgba(40, 38, 27, 0.07), 0 2px 4px -2px rgba(40, 38, 27, 0.04)",
        "claude-lg": "0 10px 15px -3px rgba(40, 38, 27, 0.08), 0 4px 6px -4px rgba(40, 38, 27, 0.04)",
        vintage: "0 1px 3px 0 rgba(40, 38, 27, 0.05), 0 1px 2px -1px rgba(40, 38, 27, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
