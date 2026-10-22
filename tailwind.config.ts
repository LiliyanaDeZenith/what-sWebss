import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        whatscat: {
          green: '#25D366',
          dark: '#128C7E',
          light: '#DCF8C6',
          gray: '#ECE5DD',
          darkBg: '#0B141A',
          darkCard: '#202C33',
          darkBubble: '#323739',
        }
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
