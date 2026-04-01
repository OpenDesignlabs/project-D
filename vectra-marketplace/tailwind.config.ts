/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Material 3 Dark Theme — audit-aligned palette (2026-03-28)
        m3: {
          // Backgrounds
          background: 'rgb(var(--m3-background) / <alpha-value>)',
          onBackground: 'rgb(var(--m3-onBackground) / <alpha-value>)',

          // Primary (brand indigo)
          primary: 'rgb(var(--m3-primary) / <alpha-value>)',
          onPrimary: 'rgb(var(--m3-onPrimary) / <alpha-value>)',
          primaryContainer: 'rgb(var(--m3-primaryContainer) / <alpha-value>)',
          onPrimaryContainer: 'rgb(var(--m3-onPrimaryContainer) / <alpha-value>)',

          // Secondary
          secondary: 'rgb(var(--m3-secondary) / <alpha-value>)',
          onSecondary: 'rgb(var(--m3-onSecondary) / <alpha-value>)',
          secondaryContainer: 'rgb(var(--m3-secondaryContainer) / <alpha-value>)',
          onSecondaryContainer: 'rgb(var(--m3-onSecondaryContainer) / <alpha-value>)',

          // Tertiary
          tertiary: 'rgb(var(--m3-tertiary) / <alpha-value>)',
          onTertiary: 'rgb(var(--m3-onTertiary) / <alpha-value>)',
          tertiaryContainer: 'rgb(var(--m3-tertiaryContainer) / <alpha-value>)',
          onTertiaryContainer: 'rgb(var(--m3-onTertiaryContainer) / <alpha-value>)',

          // Error
          error: 'rgb(var(--m3-error) / <alpha-value>)',
          onError: 'rgb(var(--m3-onError) / <alpha-value>)',
          errorContainer: 'rgb(var(--m3-errorContainer) / <alpha-value>)',
          onErrorContainer: 'rgb(var(--m3-onErrorContainer) / <alpha-value>)',

          // Surface scale
          surface: 'rgb(var(--m3-surface) / <alpha-value>)',
          onSurface: 'rgb(var(--m3-onSurface) / <alpha-value>)',
          onSurfaceVariant: 'rgb(var(--m3-onSurfaceVariant) / <alpha-value>)',
          surfaceContainerLowest: 'rgb(var(--m3-surfaceContainerLowest) / <alpha-value>)',
          surfaceContainerLow: 'rgb(var(--m3-surfaceContainerLow) / <alpha-value>)',
          surfaceContainer: 'rgb(var(--m3-surfaceContainer) / <alpha-value>)',
          surfaceContainerHigh: 'rgb(var(--m3-surfaceContainerHigh) / <alpha-value>)',
          surfaceContainerHighest: 'rgb(var(--m3-surfaceContainerHighest) / <alpha-value>)',

          // Outline
          outline: 'rgb(var(--m3-outline) / <alpha-value>)',
          outlineVariant: 'rgb(var(--m3-outlineVariant) / <alpha-value>)',
        },
        // brand.* kept — ComponentCard CATEGORY_COLORS uses raw Tailwind, not these
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#8191f8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        }
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(theme('colors.m3.outlineVariant'), transparent 1px),
                         linear-gradient(90deg, theme('colors.m3.outlineVariant'), transparent 1px)`,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer": "shimmer 5s linear infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        }
      },
    },
  },
  plugins: [],
};
