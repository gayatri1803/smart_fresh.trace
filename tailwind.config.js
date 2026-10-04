/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          warm: '#F5EFE6',
          card: '#FBF7F0',
        },
        border: {
          card: '#E2D9C8',
        },
        sidebar: {
          bg: '#1F4D3A',
          active: '#4E9B76',
          hover: '#28624A',
          text: '#F3EFE6',
          muted: '#9BB8A9',
        },
        accent: {
          DEFAULT: '#3F8F6B',
          hover: '#347859',
          light: '#EAF4EF',
          dark: '#275B44',
        },
        warning: {
          DEFAULT: '#D9A441',
          light: '#FBF4E6',
          border: '#ECD4A2',
          text: '#7A5412',
        },
        critical: {
          DEFAULT: '#B94A48',
          light: '#F8ECEC',
          border: '#E8BDBB',
          text: '#7C2725',
        },
        info: {
          DEFAULT: '#4F7C8A',
          light: '#EBF1F3',
          border: '#BDD2DA',
          text: '#274751',
        },
        content: {
          DEFAULT: '#22201D',
          muted: '#5A544A',
          subtle: '#756E63',
        }
      },
      transitionDuration: {
        DEFAULT: '150ms',
        '150': '150ms',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        'soft-hover': '0 4px 20px -2px rgba(43, 42, 38, 0.08), 0 2px 6px -1px rgba(43, 42, 38, 0.04)',
      },
      maxWidth: {
        dashboard: '1400px',
      },
      screens: {
        expanded: '1100px',
      }
    },
  },
  plugins: [],
}
