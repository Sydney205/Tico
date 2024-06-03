/** @type {import('tailwindcss').Config} */
export default {
  content: [
     "./views/**/*.{html,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: "#171b23",
        },
        yellow: {
          DEFAULT: "rgb(255, 187, 0)",
        },
        blue: {
          DEFAULT: "rgb(0, 162, 255)",
        },
      },
      keyframes: {
        shake: {
          "0%": { "margin-left": "-1rem" },
          "10%": { "margin-left": "1rem" },
          "30%": { "margin-left": "-1rem" },
          "50%": { "margin-left": "1rem" },
          "70%": { "margin-left": "-1rem" },
          "100%": { "margin-left": "1rem" },
        },

        wave: {
          "100%": { "transform": "rotate(360deg)" },
        },
      },
      animation: {
        shake: "shake 0.5s ease-in-out 1",
        wave: "wave 0.5s ease-in-out 5",
      },
    },
  },
  plugins: [],
}

