// Responsive Design Utilities for Meridian Post
// Mobile-first approach with breakpoint definitions

export const BREAKPOINTS = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px'
} as const

export const MOBILE_MAX = 767
export const TABLET_MAX = 1023
export const DESKTOP_MIN = 1024

export const responsive = {
  // Mobile-first approach
  mobile: `(max-width: ${BREAKPOINTS.mobile})`,
  tablet: `(min-width: ${BREAKPOINTS.tablet}) and (max-width: ${BREAKPOINTS.desktop})`,
  desktop: `(min-width: ${BREAKPOINTS.desktop})`,
  wide: `(min-width: ${BREAKPOINTS.wide})`
} as const

// Responsive utility functions
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= MOBILE_MAX
}

export const isTablet = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth > MOBILE_MAX && window.innerWidth <= TABLET_MAX
}

export const isDesktop = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= DESKTOP_MIN
}

// Responsive class helpers
export const getResponsiveClasses = (mobile: string, tablet?: string, desktop?: string) => {
  if (typeof window === 'undefined') return mobile
  
  if (isDesktop()) {
    return desktop || tablet || mobile
  } else if (isTablet()) {
    return tablet || mobile
  } else {
    return mobile
  }
}

// Grid system utilities
export const getGridClasses = (columns: { mobile: number; tablet?: number; desktop?: number }) => {
  if (isDesktop()) {
    return `grid grid-cols-${columns.desktop || columns.tablet || columns.mobile}`
  } else if (isTablet()) {
    return `grid grid-cols-${columns.tablet || columns.mobile}`
  } else {
    return `grid grid-cols-${columns.mobile}`
  }
}

// Touch-friendly sizing
export const getTouchSize = (size: 'sm' | 'md' | 'lg') => {
  const sizes = {
    sm: 'min-h-[44px] min-w-[44px]',
    md: 'min-h-[48px] min-w-[48px]',
    lg: 'min-h-[52px] min-w-[52px]'
  }
  return sizes[size]
}

// Image optimization utilities
export const getResponsiveImageProps = (src: string, alt: string) => {
  return {
    src,
    alt,
    className: 'w-full h-auto object-cover',
    loading: 'lazy',
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 1024px'
  }
}

// Typography utilities
export const getResponsiveTextSize = (mobile: string, tablet?: string, desktop?: string) => {
  if (isDesktop()) {
    return desktop || tablet || mobile
  } else if (isTablet()) {
    return tablet || mobile
  } else {
    return mobile
  }
}

// Spacing utilities
export const getResponsiveSpacing = (mobile: string, tablet?: string, desktop?: string) => {
  if (isDesktop()) {
    return desktop || tablet || mobile
  } else if (isTablet()) {
    return tablet || mobile
  } else {
    return mobile
  }
}

// Performance utilities
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | undefined
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}