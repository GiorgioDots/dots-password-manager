// import catppuccin from "@catppuccin/daisyui";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts}"],
  plugins: [
    // require("@tailwindcss/typography"),
    require("daisyui"),
  ],
  daisyui: {
    themes: ["cupcake", require("@catppuccin/daisyui")("frappe")],
  },
};
