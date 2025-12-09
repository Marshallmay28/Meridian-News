'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
    fallbackSrc?: string
}

export function OptimizedImage({
    src,
    alt,
    fallbackSrc = '/placeholder-image.png',
    ...props
}: OptimizedImageProps) {
    const [imgSrc, setImgSrc] = useState(src)
    const [isLoading, setIsLoading] = useState(true)

    return (
        <div className="relative overflow-hidden">
            <Image
                {...props}
                src={imgSrc}
                alt={alt}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setImgSrc(fallbackSrc)
                    setIsLoading(false)
                }}
                className={`
          ${props.className || ''}
          ${isLoading ? 'blur-sm' : 'blur-0'}
          transition-all duration-300
        `}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
            )}
        </div>
    )
}
