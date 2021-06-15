const productsBtn = document.querySelectorAll('.product-btn');
const cartProductsList = document.querySelector('.cart-content-list');
const cart = document.querySelector('.cart');
const cartQuantity = cart.querySelector('.cart-quantity');
const fullPrice = document.querySelector('.fullprice');
const orderModallOpenProd = document.querySelector('.order-modall__btn');
const orderModallList = document.querySelector('.order-modall__list');
let price = 0;
let productArray = [];

const randomId = () => {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const priceWithoutSpaces = (str) => {
	return str.replace(/\s/g, '');
};

const normalPrice = (str) => {
	return String(str).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
};

const plusFullPrice = (currentPrice) => {
	return price += currentPrice;
};

const minusFullPrice = (currentPrice) => {
	return price -= currentPrice;
};


/*возможна ошибка*/
const printQuantity = () => {
	let productsListLength = cartProductsList.querySelector('.simple').children.length;
	cartQuantity.textContent = productsListLength;
	productsListLength > 0 ? cart.classList.add('active') : cart.classList.remove('active');
};



const printFullPrice = () => {
	fullPrice.textContent = `${normalPrice(price)} ₽`;
};

const generateCartProduct = (img,title, price,id) => {
	return `
	<li class="cart-content-item">
                  <article class="cart-content-product  cart-product" data-id="${id}">
                    <img src="${img}" alt="" class="cart-product-img">
                    <div class="cart-product-text">
                      <h3 class="cart-product-title">${title}</h3>
                      <span class="cart-product-price">${normalPrice(price)} ₽</span>
                    </div>
                    <button class="cart-product-delete" aria-label="Удалить товар"></button>
                  </article>
                </li>
	
                `;
};

const deleteProducts = (productParent) => {
	let id = productParent.querySelector('.cart-product').dataset.id;
	document.querySelector(`.product[data-id="${id}"]`).querySelector('.product-btn').disabled = false;
	
	let currentPrice = parseInt(priceWithoutSpaces(productParent.querySelector('.cart-product-price').textContent));
	minusFullPrice(currentPrice);
	printFullPrice();
	productParent.remove();

	printQuantity();
};


productsBtn.forEach(el => {
	el.closest('.product').setAttribute('data-id', randomId());

	el.addEventListener('click', (e) => {
		let self = e.currentTarget;
		let parent = self.closest('.product');
		let id = parent.dataset.id;
		let img = parent.querySelector('.image-switch__img img').getAttribute('src');
		let title = parent.querySelector('.product-title').textContent;
		let priceString = priceWithoutSpaces(parent.querySelector('.product-price-current').textContent);
		let priceNumber = parseInt(priceWithoutSpaces(parent.querySelector('.product-price-current').textContent));

		console.log(title);
		console.log(priceNumber);
		console.log(id);
		console.log(priceString);
		console.log(printFullPrice);

		plusFullPrice(priceNumber);

		printFullPrice();

		cartProductsList.querySelector('.simple').insertAdjacentHTML('afterbegin', generateCartProduct(img, title, priceString, id));
		printQuantity();

		/*блок кнопки*/
		self.disabled = true;
		
	});
});

cartProductsList.addEventListener('click', (e) => {
	if (e.target.classList.contains('cart-product-delete')) {
		deleteProducts(e.target.closest('.cart-content-item'));
	}
});
/*modal*/
let flag = 0;
orderModallOpenProd.addEventListener('click', (e) => {
	if (flag == 0) {
		orderModallOpenProd.classList.add('open');
		orderModallList.style.display = 'block';
		flag = 1;
	} else {
		orderModallOpenProd.classList.remove('open');
		orderModallList.style.display = 'none';
		flag = 0;
	}
});

const generateModallProduct = (img, title, price, id) => {
	return `
		<li class="order-modal__item">
			<article class="order-modal__product order-product" data-id="${id}">
				<img src="${img}" alt="" class="order-product__img">
				<div class="order-product__text">
					<h3 class="order-product__title">${title}</h3>
					<span class="order-product__price">${normalPrice(price)}</span>
				</div>
				<button class="order-product__delete">Удалить</button>
			</article>
		</li>
	`;
};


const modall = new GraphModall({
	isOpen: (modall) => {
		console.log('opened');
		let array = cartProductsList.querySelector('.simple').children;
		let fullprice = fullPrice.textContent;
		let length = array.length;

		document.querySelector('.order-modall__quantity span').textContent = `${length} шт`;
		document.querySelector('.order-modall__summ span').textContent = `${fullprice}`;
		for (item of array) {
			console.log(item)
			let img = item.querySelector('.cart-product-img').getAttribute('src');
			let title = item.querySelector('.cart-product-title').textContent;
			let priceString = priceWithoutSpaces(item.querySelector('.cart-product-price').textContent);
			let id = item.querySelector('.cart-product').dataset.id;

			orderModallList.insertAdjacentHTML('afterbegin', generateModallProduct(img, title, priceString, id));

			let obj = {};
			obj.title = title;
			obj.price = priceString;
			productArray.push(obj);
		};

		console.log(productArray)
	},
	isClose:  () => {
		
		console.log('closed');
	}
});

document.querySelector('.order').addEventListener('submit', (e) => {
	e.preventDefault();
	let self = e.currentTarget;

	let formData = new FormData(self);
	let name = self.querySelector('[name="Имя"]').value;
	let tel = self.querySelector('[name="Телефон"]').value;
	let mail = self.querySelector('[name="Email"]').value;
	formData.append('Товары', JSON.stringify(productArray));
	formData.append('Имя', name);
	formData.append('Телефон', tel);
	formData.append('Email', mail);

	let xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				console.log('Отправлено');
			}
		}
	}

	xhr.open('POST', 'mail.php', true);
	xhr.send(formData);

	self.reset();
});