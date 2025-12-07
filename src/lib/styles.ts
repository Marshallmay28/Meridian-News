// Shared Styles and Design System for Meridian Post
// Eliminates duplicate CSS and provides consistent design tokens

export const DESIGN_TOKENS = {
  // Color palette (NYT-inspired)
  colors: {
    primary: {
      black: '#000000',
      white: '#FFFFFF',
      gray: {
        50: '#F8F9FA',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827'
      },
      blue: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A'
      }
    },
    // Typography
    typography: {
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '1.875rem', // 28px
        '4xl': '2.25rem',  // 36px
        '5xl': '3rem'     // 48px
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75'
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em'
      }
    },
    // Spacing
    spacing: {
      0: '0',
      1: '0.25rem',   // 4px
      2: '0.5rem',    // 8px
      3: '0.75rem',   // 12px
      4: '1rem',      // 16px
      5: '1.25rem',   // 20px
      6: '1.5rem',    // 24px
      8: '2rem',      // 32px
      10: '2.5rem',   // 40px
      12: '3rem',      // 48px
      16: '4rem',      // 64px
      20: '5rem',      // 80px
      24: '6rem',      // 96px
    },
    // Border radius
    borderRadius: {
      none: '0',
      sm: '0.125rem',  // 2px
      base: '0.25rem', // 4px
      md: '0.375rem', // 6px
      lg: '0.5rem',   // 8px
      xl: '0.75rem',  // 12px
      '2xl': '1rem',   // 16px
      full: '9999px'
    },
    // Shadows
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), rgba(0, 0, 0, 0.05)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.05)'
    },
    // Transitions
    transition: {
      fast: '150ms ease-in-out',
      normal: '250ms ease-in-out',
      slow: '350ms ease-in-out'
    }
  }
} as const

// Utility classes for common patterns
export const UTILITY_CLASSES = {
  // Layout utilities
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-8 lg:py-12',
  card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200',
  
  // Typography utilities
  headline: 'font-serif text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-gray-900 dark:text-white',
  subheadline: 'font-serif text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100',
  body: 'text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300',
  caption: 'text-sm text-gray-600 dark:text-gray-400',
  
  // Interactive elements
  button: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  buttonLarge: 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  
  // Navigation
  navLink: 'px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors duration-200',
  navLinkActive: 'px-3 py-2 text-sm font-medium border-b-2 border-blue-600 text-blue-600',
  
  // Responsive utilities
  hideOnMobile: 'hidden md:block',
  showOnMobile: 'block md:hidden',
  mobileFull: 'w-full md:w-auto',
  
  // Article specific
  articleContainer: 'max-w-4xl mx-auto',
  articleHeader: 'border-b border-gray-200 dark:border-gray-700 pb-4 mb-6',
  articleMeta: 'flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400',
  articleContent: 'prose prose-lg max-w-none dark:prose-invert mb-12',
  
  // AI specific
  aiBadge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs font-medium px-2 py-1 rounded-full',
  aiDisclosure: 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4',
  
  // Form utilities
  formInput: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  formLabel: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
  formTextarea: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none',
  
  // Loading and states
  loading: 'animate-pulse',
  skeleton: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
  
  // Accessibility
  srOnly: 'sr-only',
  focusVisible: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  
  // Spacing utilities
  gapSmall: 'space-y-2',
  gapMedium: 'space-y-4',
  gapLarge: 'space-y-6',
  gapXSmall: 'space-x-2',
  gapXMedium: 'space-x-4',
  gapXLarge: 'space-x-6',
  
  // Grid utilities
  gridResponsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  gridCompact: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
  
  // Card utilities
  cardHover: 'hover:shadow-lg transition-shadow duration-200',
  cardCompact: 'p-4',
  cardComfortable: 'p-6',
  
  // Animation utilities
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom duration-300',
  
  // Dark mode utilities
  darkBg: 'dark:bg-gray-900',
  darkText: 'dark:text-white',
  darkBorder: 'dark:border-gray-700',
  darkCard: 'dark:bg-gray-800 dark:border-gray-700'
} as const

// Responsive design patterns
export const RESPONSIVE_PATTERNS = {
  // Mobile-first card grid
  cardGrid: {
    base: 'grid grid-cols-1 gap-4',
    tablet: 'md:grid-cols-2 gap-6',
    desktop: 'lg:grid-cols-3 gap-8'
  },
  
  // Navigation patterns
  navigation: {
    mobile: 'flex flex-col space-y-2',
    desktop: 'flex items-center space-x-8'
  },
  
  // Article layout patterns
  articleLayout: {
    mobile: 'space-y-6',
    tablet: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
    desktop: 'grid grid-cols-1 lg:grid-cols-4 gap-8'
  },
  
  // Hero section patterns
  hero: {
    mobile: 'text-center py-8',
    tablet: 'text-left py-12',
    desktop: 'text-left py-16'
  }
} as const

// CSS Custom properties for dynamic styling
export const CSS_VARIABLES = {
  // Custom properties for responsive values
  viewportWidth: '--vw',
  containerWidth: '--container-width',
  fontSize: '--font-size',
  spacing: '--spacing',
  borderRadius: '--border-radius',
  colors: {
    primary: '--color-primary',
    secondary: '--color-secondary',
    accent: '--color-accent',
    background: '--color-background',
    text: '--color-text',
    muted: '--color-muted'
  }
} as const