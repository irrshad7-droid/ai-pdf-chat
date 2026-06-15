import { useEffect, useRef } from 'react';

export function useAutoScroll(dependency: unknown) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check if user is near bottom
    const checkScrollPosition = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      shouldAutoScrollRef.current = isNearBottom;
    };

    container.addEventListener('scroll', checkScrollPosition);
    return () => container.removeEventListener('scroll', checkScrollPosition);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !shouldAutoScrollRef.current) return;

    // Smooth scroll to bottom
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    });
  }, [dependency]);

  return containerRef;
}
