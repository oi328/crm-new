import { useState, useEffect, useRef } from 'react';

export const useTouchGesture = () => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const elementRef = useRef(null);

  const minSwipeDistance = 50; // minimum distance for a swipe
  const maxVerticalDistance = 100; // maximum vertical distance allowed

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
    setIsSwiping(false);
  };

  const onTouchMove = (e) => {
    if (!touchStart) return;
    
    const currentTouch = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
    
    setTouchEnd(currentTouch);
    
    // Calculate distances
    const distanceX = touchStart.x - currentTouch.x;
    const distanceY = touchStart.y - currentTouch.y;
    const absDistanceX = Math.abs(distanceX);
    const absDistanceY = Math.abs(distanceY);
    
    // Check if it's a horizontal swipe (more horizontal than vertical)
    if (absDistanceX > absDistanceY && absDistanceY < maxVerticalDistance) {
      setIsSwiping(true);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart.x - touchEnd.x;
    const absDistance = Math.abs(distance);
    const verticalDistance = Math.abs(touchStart.y - touchEnd.y);
    
    // Check if it's a valid swipe
    if (absDistance > minSwipeDistance && verticalDistance < maxVerticalDistance) {
      // Right swipe (negative distance means swiping from left to right)
      if (distance < 0) {
        return 'right';
      }
      // Left swipe
      if (distance > 0) {
        return 'left';
      }
    }
    
    setIsSwiping(false);
    return null;
  };

  const addTouchListeners = (element) => {
    if (!element) return;
    
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: true });
    element.addEventListener('touchend', onTouchEnd, { passive: true });
  };

  const removeTouchListeners = (element) => {
    if (!element) return;
    
    element.removeEventListener('touchstart', onTouchStart);
    element.removeEventListener('touchmove', onTouchMove);
    element.removeEventListener('touchend', onTouchEnd);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      addTouchListeners(element);
    }
    
    return () => {
      if (element) {
        removeTouchListeners(element);
      }
    };
  }, [touchStart, touchEnd]);

  return {
    elementRef,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isSwiping,
    swipeDirection: onTouchEnd(),
  };
};