/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Colors are driven by CSS variables (see src/theme/theme.css) so the
      // light/dark toggle only has to swap variables, not utility classes.
      colors: {
        canvas: 'rgb(var(--jot-canvas) / <alpha-value>)',
        surface: 'rgb(var(--jot-surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--jot-surface-muted) / <alpha-value>)',
        border: 'rgb(var(--jot-border) / <alpha-value>)',
        content: 'rgb(var(--jot-content) / <alpha-value>)',
        'content-muted': 'rgb(var(--jot-content-muted) / <alpha-value>)',
        brand: {
          DEFAULT: 'rgb(var(--jot-brand) / <alpha-value>)',
          strong: 'rgb(var(--jot-brand-strong) / <alpha-value>)',
          soft: 'rgb(var(--jot-brand-soft) / <alpha-value>)',
        },
        danger: 'rgb(var(--jot-danger) / <alpha-value>)',
        warning: 'rgb(var(--jot-warning) / <alpha-value>)',
      },
      borderRadius: {
        pill: '9999px',
        card: '16px',
      },
      minHeight: {
        touch: '44px', // NFR-5: touch targets >= 44px
      },
      minWidth: {
        touch: '44px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
