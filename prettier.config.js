/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
