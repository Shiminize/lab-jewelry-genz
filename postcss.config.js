module.exports = {
  plugins: {
    tailwindcss: {
      // Dynamic config loading based on environment
      config: process.env.TAILWIND_MODE === 'aurora' 
        ? './tailwind.demo.config.js'
        : './tailwind.config.js'
    },
    autoprefixer: {},
  },
}