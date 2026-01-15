/**
 * LazyImage Component
 *
 * Image component with lazy loading, progressive enhancement, and error handling
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  thumbnailSrc?: string;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
  blurHash?: string; // For future blurhash support
}

export function LazyImage({
  src,
  alt,
  className = '',
  placeholder = '/images/placeholder-food.png',
  thumbnailSrc,
  onClick,
  loading = 'lazy',
  blurHash,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug log on mount
  useEffect(() => {
    console.log('[LazyImage] Component props:', {
      src: src?.substring(0, 50),
      srcLength: src?.length,
      thumbnailSrc: thumbnailSrc?.substring(0, 50),
      thumbnailSrcLength: thumbnailSrc?.length,
      alt,
    });
  }, [src, thumbnailSrc, alt]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      observer.disconnect();
    };
  }, [loading, isInView]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !imgRef.current) return;

    const img = imgRef.current;

    console.log('[LazyImage] Loading image:', {
      isInView,
      hasImgRef: !!imgRef.current,
      src: src?.substring(0, 50),
      thumbnailSrc: thumbnailSrc?.substring(0, 50),
      isLoaded,
      hasError,
    });

    // Load thumbnail first if available
    if (thumbnailSrc && !isLoaded) {
      console.log('[LazyImage] Loading thumbnail...');
      const thumbLoader = new Image();
      thumbLoader.src = thumbnailSrc;
      thumbLoader.onload = () => {
        console.log('[LazyImage] Thumbnail loaded successfully');
        setIsLoading(false);
      };
      thumbLoader.onerror = () => {
        console.log('[LazyImage] Thumbnail failed to load');
        // If thumbnail fails, try loading full image directly
        setIsLoading(false);
      };
    }

    // Then load full image
    if (isInView && src) {
      console.log('[LazyImage] Loading full image...');
      const fullLoader = new Image();
      fullLoader.src = src;

      fullLoader.onload = () => {
        console.log('[LazyImage] Full image loaded successfully');
        setIsLoaded(true);
        setIsLoading(false);
        setHasError(false);
      };

      fullLoader.onerror = () => {
        console.log('[LazyImage] Full image failed to load');
        setIsLoading(false);
        setHasError(true);
        setIsLoaded(false);
      };
    }

    // Set the src directly on the img element for caching
    if (img && isInView && !hasError && src) {
      console.log('[LazyImage] Setting img.src');
      img.src = src;
      img.onload = () => {
        console.log('[LazyImage] img element loaded');
        setIsLoaded(true);
        setIsLoading(false);
      };
      img.onerror = () => {
        console.log('[LazyImage] img element error');
        setIsLoading(false);
        setHasError(true);
      };
    }
  }, [isInView, src, thumbnailSrc, hasError, isLoaded]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`} onClick={onClick}>
      {/* Loading placeholder / thumbnail */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-muted flex items-center justify-center"
          >
            {/* Skeleton shimmer effect */}
            <div className="w-full h-full bg-gradient-to-r from-muted via-muted-foreground/20 to-muted animate-shimmer" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thumbnail or placeholder */}
      <AnimatePresence mode="wait">
        {!isLoaded && !isLoading && !hasError && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={thumbnailSrc || placeholder}
            alt={alt}
            className="w-full h-full object-cover filter blur-sm scale-110"
          />
        )}
      </AnimatePresence>

      {/* Full image */}
      <AnimatePresence mode="wait">
        {(isLoaded || hasError) && (
          <motion.img
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            ref={imgRef}
            src={hasError ? placeholder : src}
            alt={alt}
            className={`w-full h-full object-cover ${isLoaded ? 'loaded' : ''}`}
            style={{ display: isLoaded || hasError ? 'block' : 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50">
          <svg
            className="w-8 h-8 text-muted-foreground mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs text-muted-foreground">{alt}</span>
        </div>
      )}

      {/* Overlay when loading completes (for smooth transition) */}
      {!isLoaded && !hasError && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
