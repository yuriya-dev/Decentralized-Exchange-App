/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Penting untuk dual mode
  theme: {
    extend: {
      colors: {
        // Mode Gelap (Premium Fintech: Navy -> Cyan -> Orange)
        fintech: {
          bg: '#020617',       // Deep Navy (Base Background)
          card: '#0F172A',     // Navy Slate (Card Base)
          cardHover: '#1E293B',// Lighter Navy for Hover
          border: '#1E293B',   // Subtle Border
          text: '#F8FAFC',     // Crisp White Text
          muted: '#94A3B8',    // Muted Blue-Grey
          primary: '#06B6D4',  // Cyan Neon (Main Action)
          secondary: '#3B82F6',// Royal Blue (Gradient Partner)
          accent: '#F59E0B',   // Amber/Orange (Highlights & CTA)
          success: '#10B981',  // Emerald Green
          danger: '#EF4444',   // Red
        },
        // Mode Terang (Clean Corporate)
        light: {
          bg: '#F0F9FF',       // Very Light Blue tint
          card: '#FFFFFF',     // Pure White
          border: '#E2E8F0',   // Slate-200
          text: '#0F172A',     // Slate-900 (High Contrast)
          muted: '#64748B',    // Slate-500
          primary: '#0284C7',  // Sky-600 (Darker for light mode)
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        // Gradient Khusus
        'primary-gradient': 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)', // Cyan to Blue
        'accent-gradient': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',  // Orange to Amber
        'glass-gradient': 'linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.3) 100%)', // Untuk Card Glass
        'fintech-mesh': 'radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 100%)', // Background halus
      },
      boxShadow: {
        'neon': '0 0 20px rgba(6, 182, 212, 0.5)', // Glow effect untuk primary cyan
        'neon-accent': '0 0 20px rgba(245, 158, 11, 0.5)', // Glow effect untuk accent orange
      }
    },
  },
  plugins: [],
}