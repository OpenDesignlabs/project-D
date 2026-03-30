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
          background:              '#0f0f13',
          onBackground:            '#e4e1e9',

          // Primary (brand indigo)
          primary:                 '#bdb9ff',
          onPrimary:               '#28018a',
          primaryContainer:        '#3f009f',
          onPrimaryContainer:      '#e3dfff',

          // Secondary
          secondary:               '#C0C6DD',
          onSecondary:             '#2A3042',
          secondaryContainer:      '#4a4458',
          onSecondaryContainer:    '#e8def8',

          // Tertiary
          tertiary:                '#efb8c8',
          onTertiary:              '#44263F',
          tertiaryContainer:       '#5D3C57',
          onTertiaryContainer:     '#FFD7F3',

          // Error
          error:                   '#FFB4AB',
          onError:                 '#690005',
          errorContainer:          '#93000A',
          onErrorContainer:        '#FFDAD6',

          // Surface scale (darkest → lightest)
          surface:                 '#0f0f13',
          onSurface:               '#e6e1e9',
          onSurfaceVariant:        '#cab4d9',
          surfaceContainerLowest:  '#0d0d10',
          surfaceContainerLow:     '#1A1B21',
          surfaceContainer:        '#1c1b21',
          surfaceContainerHigh:    '#26252b',
          surfaceContainerHighest: '#312f38',

          // Outline
          outline:                 '#958da5',
          outlineVariant:          '#49454f',
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
