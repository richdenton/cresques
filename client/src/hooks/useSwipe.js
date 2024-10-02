import { useEffect, useState } from 'react';

export default function useSwipe({ ref, threshold }) {

	// Store touch coordinates
	const [direction, setDirection] = useState(null);
	const [touchStartX, setTouchStartX] = useState(null);
	const [touchStartY, setTouchStartY] = useState(null);
	const [touchEndX, setTouchEndX] = useState(null);
	const [touchEndY, setTouchEndY] = useState(null);
	const [touchDeltaX, setTouchDeltaX] = useState(0);
	const [touchDeltaY, setTouchDeltaY] = useState(0);
	const [isSwipingHorizontal, setIsSwipingHorizontal] = useState(false);
	const [isSwipingVertical, setIsSwipingVertical] = useState(false);

	// Check for touch support
	const supportsTouch = 'ontouchstart' in window;
	const getTouchAction = (event) => supportsTouch ? event.touches[0] : event;

	// Apply touch/mouse listeners
	useEffect(() => {
		const currentElement = ref.current;
		if (!currentElement) {
			return;
		}
		if (supportsTouch) {
			currentElement.addEventListener('touchstart', handleTouchStart);
			currentElement.addEventListener('touchmove', handleTouchMove);
			currentElement.addEventListener('touchend', handleTouchEnd);
		} else {
			currentElement.addEventListener('mousedown', handleTouchStart);
			currentElement.addEventListener('mousemove', handleTouchMove);
			currentElement.addEventListener('mouseup', handleTouchEnd);
		}
		return () => {
			if (supportsTouch) {
				currentElement.removeEventListener('touchstart', handleTouchStart);
				currentElement.removeEventListener('touchmove', handleTouchMove);
				currentElement.removeEventListener('touchend', handleTouchEnd);
			} else {
				currentElement.removeEventListener('mousedown', handleTouchStart);
				currentElement.removeEventListener('mousemove', handleTouchMove);
				currentElement.removeEventListener('mouseup', handleTouchEnd);
			}
		}
	}, [ref, handleTouchStart, handleTouchMove, handleTouchEnd]);

	function handleTouchStart(event) {
		const action = getTouchAction(event);
		setDirection(null);
		setTouchStartX(action.pageX);
		setTouchStartY(action.pageY);
		setTouchEndX(action.pageX);
		setTouchEndY(action.pageY);
		setIsSwipingHorizontal(false);
		setIsSwipingVertical(false);
	}

	function handleTouchMove(event) {
		if (touchStartX || touchStartY) {
			const action = getTouchAction(event);
			if (!isSwipingHorizontal && !isSwipingVertical) {
				const deltaX = Math.abs(touchStartX - action.pageX);
				const deltaY = Math.abs(touchStartY - action.pageY);
				if (deltaX < deltaY - 5) {
					setIsSwipingHorizontal(false);
					setIsSwipingVertical(true);
				} else if (deltaX > deltaY + 5) {
					setIsSwipingVertical(false);
					setIsSwipingHorizontal(true);
				}
			}
			if (isSwipingHorizontal && touchStartX) {
				setTouchEndX(action.pageX);
				setTouchDeltaX(action.pageX - touchStartX);
			}
			if (isSwipingVertical && touchStartY) {
				setTouchEndY(action.pageY);
				setTouchDeltaY(action.pageY - touchStartY);
			}
		}
	}

	function handleTouchEnd() {
		if (isSwipingHorizontal && touchStartX) {
			if (touchStartX > touchEndX + threshold) {
				setDirection('e');
			} else if (touchStartX < touchEndX - threshold) {
				setDirection('w');
			}
		} else {
			if (touchStartY > touchEndY + threshold) {
				setDirection('s');
			} else if (touchStartY < touchEndY - threshold) {
				setDirection('n');
			}
		}
		setTouchStartX(null);
		setTouchStartY(null);
		setTouchEndX(null);
		setTouchEndY(null);
		setTouchDeltaX(0);
		setTouchDeltaY(0);
		setIsSwipingHorizontal(false);
		setIsSwipingVertical(false);
	}

	return { direction, touchDeltaX, touchDeltaY};
};