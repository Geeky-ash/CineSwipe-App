/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* ── Aura Noir Surface Hierarchy ── */
        "surface-container-lowest": "#000000",
        "surface-dim":              "#0e0e0e",
        "surface":                  "#0e0e0e",
        "surface-container-low":    "#131313",
        "surface-container":        "#1a1a1a",
        "surface-container-high":   "#20201f",
        "surface-container-highest":"#262626",
        "surface-bright":           "#2c2c2c",
        "surface-variant":          "#262626",
        "background":               "#0e0e0e",

        /* ── Primary — Neon Magenta ── */
        "primary":                  "#ff8aa9",
        "primary-container":        "#ff719b",
        "primary-dim":              "#e4006c",
        "primary-fixed":            "#ff719b",
        "primary-fixed-dim":        "#ff528c",
        "on-primary":               "#62002b",
        "on-primary-container":     "#4c0020",
        "on-primary-fixed":         "#000000",
        "on-primary-fixed-variant": "#5e0028",
        "inverse-primary":          "#bc0058",

        /* ── Secondary ── */
        "secondary":                "#fb88c6",
        "secondary-container":      "#7e205a",
        "secondary-dim":            "#eb7bb8",
        "secondary-fixed":          "#ffc0dd",
        "secondary-fixed-dim":      "#ffaad4",
        "on-secondary":             "#5e0040",
        "on-secondary-container":   "#ffbedc",
        "on-secondary-fixed":       "#660847",

        /* ── Tertiary — Electric Violet ── */
        "tertiary":                 "#ab9fff",
        "tertiary-container":       "#9e8ffd",
        "tertiary-dim":             "#9e8ffd",
        "tertiary-fixed":           "#b1a5ff",
        "tertiary-fixed-dim":       "#a395ff",
        "on-tertiary":              "#2a1183",
        "on-tertiary-container":    "#1d0071",

        /* ── Text & Content ── */
        "on-surface":               "#ffffff",
        "on-surface-variant":       "#adaaaa",
        "on-background":            "#ffffff",
        "inverse-on-surface":       "#565555",
        "inverse-surface":          "#fcf9f8",

        /* ── Accents & Utilities ── */
        "outline":                  "#767575",
        "outline-variant":          "#484847",
        "error":                    "#ff716c",
        "error-dim":                "#d7383b",
        "error-container":          "#9f0519",
        "on-error":                 "#490006",
        "on-error-container":       "#ffa8a3",
        "surface-tint":             "#ff8aa9",
      },

      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body":     ["Manrope", "sans-serif"],
        "label":    ["Space Grotesk", "sans-serif"],
      },

      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg":      "1rem",
        "xl":      "1.5rem",
        "2xl":     "2rem",
        "3xl":     "3rem",
        "full":    "9999px",
      },

      animation: {
        "spring-bounce": "springBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "neon-pulse":    "neonPulse 3s ease-in-out infinite",
        "film-reel":     "filmReel 0.8s ease-in-out",
      },

      spacing: {
        "section": "5rem",
      },

      backdropBlur: {
        "glass": "24px",
        "hero":  "32px",
      },
    },
  },
  plugins: [],
}
