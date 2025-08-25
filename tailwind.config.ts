
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Enhanced Color System
				surface: {
					DEFAULT: 'hsl(var(--surface))',
					hover: 'hsl(var(--surface-hover))',
					active: 'hsl(var(--surface-active))',
					glass: 'hsl(var(--surface-glass))'
				},
				emerald: {
					DEFAULT: 'hsl(var(--emerald))',
					dark: 'hsl(var(--emerald-dark))',
					darker: 'hsl(var(--emerald-darker))',
					light: 'hsl(var(--emerald-light))'
				},
				cyan: {
					DEFAULT: 'hsl(var(--cyan))',
					dark: 'hsl(var(--cyan-dark))'
				},
				purple: {
					DEFAULT: 'hsl(var(--purple))',
					dark: 'hsl(var(--purple-dark))'
				},
				orange: {
					DEFAULT: 'hsl(var(--orange))',
					dark: 'hsl(var(--orange-dark))'
				},
				text: {
					primary: 'hsl(var(--text-primary))',
					secondary: 'hsl(var(--text-secondary))',
					muted: 'hsl(var(--text-muted))',
					accent: 'hsl(var(--text-accent))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-surface': 'var(--gradient-surface)',
				'gradient-glass': 'var(--gradient-glass)',
				'gradient-mesh': 'var(--gradient-mesh)',
				'gradient-cyber': 'var(--gradient-primary)',
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
				'flash': 'linear-gradient(45deg, hsl(var(--emerald) / 0.1), hsl(var(--cyan) / 0.1), hsl(var(--purple) / 0.1))'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'card': 'var(--shadow-card)',
				'glow': 'var(--shadow-glow)',
				'neon': 'var(--shadow-neon)',
				'cyber': 'var(--shadow-elegant)',
				'widget': '0 4px 20px -2px hsl(var(--emerald) / 0.2), 0 0 40px -10px hsl(var(--emerald) / 0.1)',
				'floating': '0 20px 25px -5px hsl(220 50% 4% / 0.1), 0 10px 10px -5px hsl(220 50% 4% / 0.04)'
			},
			transitionProperty: {
				'smooth': 'var(--transition-smooth)',
				'fast': 'var(--transition-fast)',
				'spring': 'var(--transition-spring)',
				'bounce': 'var(--transition-bounce)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backdropBlur: {
				xs: '2px',
				'2xl': '40px',
				'3xl': '64px'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				// Enhanced fade animations
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
					'100%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
				},
				// Advanced scale animations
				'scale-in': {
					'0%': { transform: 'scale(0.8) rotate(-5deg)', opacity: '0' },
					'100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
				},
				'scale-out': {
					from: { transform: 'scale(1) rotate(0deg)', opacity: '1' },
					to: { transform: 'scale(0.8) rotate(-5deg)', opacity: '0' },
				},
				// Enhanced slide animations
				'slide-in-right': {
					'0%': { transform: 'translateX(100%) rotateY(90deg)' },
					'100%': { transform: 'translateX(0) rotateY(0deg)' },
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0) rotateY(0deg)' },
					'100%': { transform: 'translateX(100%) rotateY(90deg)' },
				},
				// New advanced animations
				'float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'33%': { transform: 'translateY(-10px) rotate(1deg)' },
					'66%': { transform: 'translateY(-5px) rotate(-1deg)' },
				},
				'pulseGlow': {
					'0%, 100%': { 
						boxShadow: '0 0 5px hsl(var(--emerald) / 0.5), 0 0 20px hsl(var(--emerald) / 0.2)' 
					},
					'50%': { 
						boxShadow: '0 0 20px hsl(var(--emerald) / 0.8), 0 0 40px hsl(var(--emerald) / 0.4)' 
					},
				},
				'slideGlow': {
					'0%': { backgroundPosition: '-200% center' },
					'100%': { backgroundPosition: '200% center' },
				},
				'matrix': {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(-100vh)' },
				},
				'bounce-in': {
					'0%': { 
						transform: 'scale(0.3) rotate(-180deg)', 
						opacity: '0',
						animationTimingFunction: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
					},
					'20%': { 
						transform: 'scale(1.1) rotate(-10deg)' 
					},
					'40%': { 
						transform: 'scale(0.9) rotate(5deg)' 
					},
					'60%': { 
						transform: 'scale(1.03) rotate(-2deg)' 
					},
					'80%': { 
						transform: 'scale(0.97) rotate(1deg)' 
					},
					'100%': { 
						transform: 'scale(1) rotate(0deg)', 
						opacity: '1' 
					},
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' },
				},
				'cyber-scan': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100vw)' },
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' },
				},
				'flash': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				'morph': {
					'0%, 100%': { borderRadius: '12px' },
					'25%': { borderRadius: '50% 12px' },
					'50%': { borderRadius: '12px 50%' },
					'75%': { borderRadius: '50% 50%' },
				},
				'widget-float': {
					'0%, 100%': { transform: 'translateY(0px) scale(1)' },
					'50%': { transform: 'translateY(-5px) scale(1.02)' },
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.3s ease-out',
				'accordion-up': 'accordion-up 0.3s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-out': 'fade-out 0.5s ease-out',
				'scale-in': 'scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'scale-out': 'scale-out 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'slide-out-right': 'slide-out-right 0.5s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
				'slide-glow': 'slideGlow 2s linear infinite',
				'matrix': 'matrix 20s linear infinite',
				'bounce-in': 'bounce-in 0.7s ease-out',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				'cyber-scan': 'cyber-scan 3s linear infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'flash': 'flash 2s ease-in-out infinite',
				'morph': 'morph 4s ease-in-out infinite',
				'widget-float': 'widget-float 3s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 4s ease-in-out infinite',
				// Combined animations
				'enter': 'fade-in 0.5s ease-out, scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'exit': 'fade-out 0.5s ease-out, scale-out 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			}
		}
	},
        plugins: [tailwindcssAnimate],
} satisfies Config;
