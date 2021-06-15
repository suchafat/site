class GraphModall {
	constructor(options) {
		let defaultOptions = {
			isOpen: ()=>{},
			isClose: ()=>{},
		}
		this.options = Object.assign(defaultOptions, options);
		this.modall = document.querySelector('.modall');
		this.speed = 300;
		this.animation = false;
		this.reOpen = false;
		this.nextWindow = false;
		this.modallContainer = false;
		this.isOpened = false;
		this.previousActiveElement = false;
		this._focusElements = [
				'a[href]',
				'area[href]',
				'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
				'select:not([disabled]):not([aria-hidden])',
				'textarea:not([disabled]):not([aria-hidden])',
				'button:not([disabled]):not([aria-hidden])',
				'iframe',
				'object',
				'embed',
				'[contenteditable]',
				'[tabindex]:not([tabindex^="-"])'
		];
		this.fixBlocks = document.querySelectorAll('.fix-block');
		this.events();
	}

	events() {
		document.addEventListener('click', function(e) {
		 	const clickedElement = e.target.closest(`[data-graph-path]`);
		 	if (clickedElement) {
				let target = clickedElement.dataset.graphPath;
				let animation = clickedElement.dataset.graphAnimation;
				let speed =  clickedElement.dataset.graphSpeed;
				this.animation = animation ? animation : 'fadee';
				this.speed = speed ? parseInt(speed) : 300;
				this.nextWindow = document.querySelector(`[data-graph-target="${target}"]`); 
				this.open();
				return;
			}

			if (e.target.closest('.modall__close')) {
				this.close();
				return;
			}
		}.bind(this));

		window.addEventListener('keydown', function(e) {
			if (e.keyCode == 27) {
				if (this.modallContainer.classList.contains('modall-open')) {
					this.close();
				}
			}

			if (e.which == 9 && this.isOpened) {
				this.focusCatch(e);
				return;
			}
		}.bind(this));

		this.modall.addEventListener('click', function(e) {
			if (!e.target.classList.contains('modall__container') && !e.target.closest('.modall__container') && this.isOpened) {
				this.close();
			}
		}.bind(this));
	}

	open(selector) {
		this.previousActiveElement = document.activeElement;

		if (this.isOpened) {
			this.reOpen = true;
			this.close();
			return;
		}

		this.modallContainer = this.nextWindow;

		if (selector) {
			this.modallContainer = document.querySelector(`[data-graph-target="${selector}"]`);
		}

		this.modall.style.setProperty('--transition-time', `${this.speed / 1000}s`);
		this.modall.classList.add('is-open');
		this.disableScroll();
		
		this.modallContainer.classList.add('modall-open');
		this.modallContainer.classList.add(this.animation);
		
		setTimeout(() => {
			this.options.isOpen(this);
			this.modallContainer.classList.add('animate-open');
			this.isOpened = true;
			this.focusTrap();
		}, this.speed);
	}
	
	close() {
		if (this.modallContainer) {
			this.modallContainer.classList.remove('animate-open');
			this.modallContainer.classList.remove(this.animation);
			this.modall.classList.remove('is-open');
			this.modallContainer.classList.remove('modall-open');
			
			this.enableScroll();
			this.options.isClose(this);
			this.isOpened = false;
			this.focusTrap();

			if (this.reOpen) {
				this.reOpen = false;
				this.open();
			}
		}
	}

	focusCatch(e) {
		const nodes = this.modallContainer.querySelectorAll(this._focusElements);
		const nodesArray = Array.prototype.slice.call(nodes);
		const focusedItemIndex = nodesArray.indexOf(document.activeElement)
		if (e.shiftKey && focusedItemIndex === 0) {
			nodesArray[nodesArray.length - 1].focus();
			e.preventDefault();
		}
		if (!e.shiftKey && focusedItemIndex === nodesArray.length - 1) {
			nodesArray[0].focus();
			e.preventDefault();
		}
	}

	focusTrap() {
		const nodes = this.modallContainer.querySelectorAll(this._focusElements);
		if (this.isOpened) {
			if (nodes.length) nodes[0].focus();
		} else {
			this.previousActiveElement.focus();
		}
	}

	disableScroll() {
		let pagePosition = window.scrollY;
		this.lockPadding();
		document.body.classList.add('disable-scroll');
		document.body.dataset.position = pagePosition;
		document.body.style.top = -pagePosition + 'px';
	}

	enableScroll() {
		let pagePosition = parseInt(document.body.dataset.position, 10);
		this.unlockPadding();
		document.body.style.top = 'auto';
		document.body.classList.remove('disable-scroll');
		window.scroll({
			top: pagePosition,
			left: 0
		});
		document.body.removeAttribute('data-position');
	}

	lockPadding() {
		let paddingOffset = window.innerWidth - document.body.offsetWidth + 'px';
		this.fixBlocks.forEach((el) => {
			el.style.paddingRight = paddingOffset;
		});
		document.body.style.paddingRight = paddingOffset;
	}

	unlockPadding() {
		this.fixBlocks.forEach((el) => {
			el.style.paddingRight = '0px';
		});
		document.body.style.paddingRight = '0px';
	}
}

// new Modall().open('second');
