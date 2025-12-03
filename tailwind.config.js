/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./app/**", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#030014',
        accent: '#ab8bff',
        secondary: '#151312',
        light: {
          100: '#d6c6ff',
          200: '#a8b5db',
          300: '#9ca4ab'
        },
        dark: {
          100: '#221f3d',
          200: '#6f0d73',
        }
      }
    },
  },
  plugins: [],
}