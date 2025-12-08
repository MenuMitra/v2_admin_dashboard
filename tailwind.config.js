export default {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}", // adjust to your project structure
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          50: '#ecf3ff',
          100: '#dde9ff',
          200: '#c2d6ff',
          300: '#9cb9ff',
          400: '#7592ff',
          500: '#465fff',
          600: '#3641f5',
          800: '#252dae',
          950: '#161950',
        },
        'orange-brand': {
          DEFAULT: '#f7941d',
          hover: '#d67e15',
        },
        'error': {
          50: '#fef3f2',
          300: '#fda29b',
          400: '#f97066',
          500: '#f04438',
          600: '#d92d20',
          700: '#b42318',
          800: '#912018',
        },
        'success': {
          50: '#ecfdf3',
          300: '#6ce9a6',
          500: '#12b76a',
          600: '#039855',
          700: '#027a48',
          800: '#05603a',
        },
        'warning': {
          50: '#fffaeb',
          400: '#fdb022',
          500: '#f79009',
          600: '#dc6803',
          700: '#b54708',
        },
      },
    },
  },
  plugins: [],
};
