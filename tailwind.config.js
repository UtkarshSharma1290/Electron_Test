/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        "h-sm": { raw: "(min-height: 600px)" },
        "h-md": { raw: "(min-height: 800px)" },
        "h-lg": { raw: "(min-height: 1000px)" },
        "h-xl": { raw: "(min-height: 1200px)" },
      },
      colors: {
        Neon: "#DFFF2D",
        GreyThemeBG: "#F2F4F7",
        primaryBG: "#1F1F1F",
        PrimaryBlue: "#0175E0",
        blackBG: "#000000",
        white: "#fff",
        GrayText: "#EAECF0",
        GreyText: "#98A2B3",
        InputPlaceholderText: "#FFFFFF",
        GreenBorder: "#12B76A",
        GreyBackground: "#363636",
        lightWhiteBG: "#F9FAFB",
        LightGrey: "#D0D5DD",
        Red1: "#F04438",
      },
      fontFamily: {
        DMSans: ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        "custom-radius": "8px 8px 0px 8px",
      },
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(178deg, #000 39.83%, #DFFF2D 137.72%)",
      },
      boxShadow: {
        "custom-first": "0px 2px 43px 0px rgba(0, 0, 0, 0.04)",
      },
      opacity: {
        13: "0.13",
      },
    },
  },
  plugins: [],
};
