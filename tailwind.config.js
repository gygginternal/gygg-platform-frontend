const flowbiteReact = require("flowbite-react/plugin/tailwindcss");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", ".flowbite-react/class-list.json"],

  theme: {
    extend: {
      colors: {
        gold: "#D99633", // or use any name you like
        white: "#FFFFFF",
        primary: "#3D4D55",
      },
    },
  },

  plugins: [flowbiteReact],
};
