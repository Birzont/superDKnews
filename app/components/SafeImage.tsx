'use client'

import Image from 'next/image'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
}

export default function SafeImage({ src, alt, className, fill = false, width, height }: SafeImageProps) {
  const defaultImageUrl = 'https://images.unsplash.com/photo-1495020683877-95802df4ae64?w=800&h=400&fit=crop'
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    target.src = defaultImageUrl
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        onError={handleError}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  )
} 