module.exports = {
  plugins: {
    // Always point to the primary Tailwind config to avoid env clashes
    tailwindcss: { config: './tailwind.config.js' },
    autoprefixer: {},
  },
}