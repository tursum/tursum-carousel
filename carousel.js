const setCarousel = ({id, columns = 1, useArrows = false, useDrag = false, timer = 0, transition = 200, cycle = false}) => {
	if (!document.getElementById(id)) return;

	let carousel = document.getElementById(id);
	let stage = carousel.firstElementChild;
	stage.style.transition = transition + 'ms';

	let slides = stage.querySelectorAll('li');

	let _slideWidth = undefined;

	let counter = 0;

	/*const cycleCarousel = () => {
		if (!cycle) return;

		let lastSlideClone = slides[slides.length - 1].cloneNode(true);
		stage.append(lastSlideClone);
		slides = stage.querySelectorAll('li');
	}

	cycleCarousel();*/

	const timerStep = () => {
		if (counter >= maxShifts) {
			currentCarouselShift = 0;
			stage.style.transform = `translate(${currentCarouselShift}px)`;
			counter = 0;
			return;
		}
	
		currentCarouselShift -= _slideWidth;
		stage.style.transform = `translate(${currentCarouselShift}px)`;
		counter++;
	}

	let carouselTimer = timer && setInterval(timerStep, timer);

	const correctCarouselWidth = () => {
		let stageBorder = stage.clientLeft; //ширина границы сцены, чтобы слайд не сдвигался
		let slideWidth = (carousel.clientWidth - stageBorder) / columns;
		
		slides.forEach(slide => {
			slide.style.width = `${slideWidth}px`;
		});

		let stageWidth = slides.length * slideWidth;
		stage.style.width = stageWidth + 'px';

		_slideWidth = slideWidth;
	} //correctCarouselWidth

	correctCarouselWidth();
	window.addEventListener('resize', correctCarouselWidth);

	let currentCarouselShift = 0;
	let maxShifts = slides.length - columns;

	const correctCarouselResize = () => {
		currentCarouselShift = counter * -_slideWidth;
		stage.style.transform = `translate(${currentCarouselShift}px)`;
	} //correctCarouselResize

	window.addEventListener('resize', correctCarouselResize);

	const addArrows = () => {		
		const moveCarouselByArrow = e => {
			if (e.target.classList.contains('arrow-right')) {
				if (currentCarouselShift > maxShifts * -_slideWidth) {
					clearInterval(carouselTimer);
					currentCarouselShift -= _slideWidth;
					counter++;
					carouselTimer = timer && setInterval(timerStep, timer);
				}
			} else {
				if (currentCarouselShift < 0) {
					clearInterval(carouselTimer);
					currentCarouselShift += _slideWidth;
					counter--;
					carouselTimer = timer && setInterval(timerStep, timer);
				}
			}

			stage.style.transform = `translate(${currentCarouselShift}px)`;
		} //moveCarouselByArrow

		if (useArrows) {
			let arrows = document.createElement('div');
			arrows.classList.add('arrows');

			let arrowLeft = document.createElement('div');
			arrowLeft.classList.add('arrow');
			arrowLeft.classList.add('arrow-left');
			arrowLeft.addEventListener('click', moveCarouselByArrow);
			arrows.append(arrowLeft);

			let arrowRight = document.createElement('div');
			arrowRight.classList.add('arrow');
			arrowRight.classList.add('arrow-right');
			arrowRight.addEventListener('click', moveCarouselByArrow);
			arrows.append(arrowRight);

			carousel.append(arrows);
		}
	} //addArrows

	addArrows();

	const dragCarousel = () => {
		if (!useDrag) return;
		stage.onmousedown = e => {
			e.preventDefault();
			let startTime = Date.now();
			
			clearInterval(carouselTimer);

			stage.style.transition = '0ms';

			let startPos = e.pageX;
			let bufShift = 0;
			let _currentMouseShift = 0;

			const endDrag = () => {
				let endTime = Date.now() - startTime;

				let shift = _currentMouseShift;

				if ((Math.abs(shift) > _slideWidth / 2) || endTime < 200) {
					if (shift > 0) {
						let quantity = (Math.floor((shift - _slideWidth / 2) / _slideWidth) + 1) || 1;
						if (currentCarouselShift + _slideWidth * quantity <= 0) {
							currentCarouselShift += _slideWidth * quantity;
							counter -= quantity;
						} else {
							currentCarouselShift = 0;
							counter = 0;
						}
					}

					if (shift < 0) {
						let quantity = (Math.floor((shift + _slideWidth / 2) / -_slideWidth) + 1) || 1;
						if (currentCarouselShift - _slideWidth * quantity >= maxShifts * -_slideWidth) {
							currentCarouselShift -= _slideWidth * quantity;
							counter += quantity;
						} else {
							currentCarouselShift = maxShifts * -_slideWidth;
							counter = maxShifts;
						}
					}
				}

				stage.style.transform = `translate(${currentCarouselShift}px)`;				

				window.onmousemove = null;
				stage.onmouseup = null;

				stage.style.transition = transition + 'ms';

				carouselTimer = timer && setInterval(timerStep, timer);
			}

			window.onmousemove = e => {
				if (!e.target.closest('.stage')) {
					endDrag();
					return;
				}
				let currentPos = e.pageX;
				let currentMouseShift = currentPos - startPos;
				bufShift = currentCarouselShift + currentMouseShift;

				stage.style.transform = `translate(${bufShift}px)`;
				_currentMouseShift = currentMouseShift;
			}
			
			stage.onmouseup = endDrag;
		}
	}

	dragCarousel();
} //setCarousel
