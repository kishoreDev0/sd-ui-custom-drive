module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        spin: 'spin 1s linear infinite',
        'spin-fast': 'spin 0.5s linear infinite',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
