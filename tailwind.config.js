const {} = require("tailwindcss/defaultTheme");

module.exports = {
# Added comment
  mode: "jit",
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  variants: {
    extend: {},
  },
};
