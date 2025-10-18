console.log("Main script loaded");

/* ------- UI toggles (search & login) ------- */
let searchform = document.querySelector('.search-form');
let loginform = document.querySelector('.login-form-container');

document.querySelector('#search-btn')?.addEventListener('click', () => {
  searchform.classList.toggle('active');
});

document.querySelector('#login-btn')?.addEventListener('click', () => {
  loginform.classList.toggle('active');
});

document.querySelector('#close-login-btn')?.addEventListener('click', () => {
  loginform.classList.remove('active');
});

/* ------- Swiper setups (kept from original) ------- */
try {
  var swiperBooks = new Swiper(".books-list", {
    loop: true,
    centeredSlides: true,
    spaceBetween: 20,
    slidesPerView: 3,
    autoplay: {
      delay: 9500,
      disableOnInteraction: false,
    },
  });

  var swiperFeatured = new Swiper(".featured-slider", {
    loop: true,
    spaceBetween: 30,
    centeredSlides: false,
    slidesPerView: 5,
    breakpoints: {
      758: { slidesPerView: 2 },
      563: { slidesPerView: 1 }
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  var swiperReview = new Swiper(".review-slider", {
    spaceBetween: 10,
    loop: true,
    centeredSlides: true,
    autoplay:{
      delay:9500,
      disableOnInteraction:false,
    },
    breakpoints: {
      0:{ slidesPerView: 1 },
      768:{ slidesPerView:3 },
      1024:{ slidesPerView: 4 },
    }
  });
} catch(e){ /* ignore if Swiper not on page */ }

/* ------- Simple client-side cart manager ------- */
(function () {
  // Book catalog (10 books) - IDs 1..10
  const CATALOG = [
    { id: 1, title: "The Night Reader", price: 12.99, img: "./image/book-1.png" },
    { id: 2, title: "Stories of Tomorrow", price: 15.99, img: "./image/book-2.png" },
    { id: 3, title: "JavaScript for Readers", price: 19.49, img: "./image/book-3.png" },
    { id: 4, title: "Design Patterns", price: 22.00, img: "./image/book-4.png" },
    { id: 5, title: "The Lonely Island", price: 10.00, img: "./image/book-5.png" },
    { id: 6, title: "Science of Everything", price: 17.75, img: "./image/book-6.png" },
    { id: 7, title: "Featured Book 7", price: 15.99, img: "./image/book-7.png" },
    { id: 8, title: "The Green Way", price: 9.50, img: "./image/book-8.png" },
    { id: 9, title: "Hidden Histories", price: 18.00, img: "./image/book-9.png" },
    { id: 10, title: "Modern Cooking", price: 14.25, img: "./image/book-10.png" }
  ];

  // Expose in window for pages that need it
  window.bookCatalog = CATALOG;

  class CartManager {
    constructor() {
      // load from localStorage or initialize
      this.cart = JSON.parse(localStorage.getItem('booklet_cart') || '[]');
      this.shipping = 5.00;
      this.onChangeCallbacks = [];
    }
    save() { localStorage.setItem('booklet_cart', JSON.stringify(this.cart)); this.notify(); }
    addItem(book, qty=1) {
      const idx = this.cart.findIndex(i => i.id === book.id);
      if (idx > -1) {
        this.cart[idx].qty += qty;
      } else {
        this.cart.push({ id: book.id, title: book.title, price: book.price, img: book.img, qty: qty });
      }
      this.save();
    }
    removeItem(id) {
      this.cart = this.cart.filter(i => i.id !== id);
      this.save();
    }
    setQty(id, qty) {
      const idx = this.cart.findIndex(i => i.id === id);
      if (idx > -1) {
        this.cart[idx].qty = Math.max(0, parseInt(qty) || 0);
        if (this.cart[idx].qty === 0) this.removeItem(id);
        this.save();
      }
    }
    clearCart() {
      this.cart = []; this.save();
    }
    getSubtotal() {
      return this.cart.reduce((s, it) => s + (it.price * it.qty), 0);
    }
    getTotal() {
      return +(this.getSubtotal() + (this.cart.length ? this.shipping : 0)).toFixed(2);
    }
    onChange(cb) { this.onChangeCallbacks.push(cb); }
    notify() { this.onChangeCallbacks.forEach(cb => cb(this.cart)); }
  }

  // singleton
  if (!window.cartManager) window.cartManager = new CartManager();

  // If on cart.html or any page with product listing, render product grid
  document.addEventListener('DOMContentLoaded', function () {
    // Render available products on cart page
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
      productsGrid.innerHTML = '';
      window.bookCatalog.forEach(book => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${book.img}" alt="${book.title}" />
          <div class="meta">
            <h4>${book.title}</h4>
            <p class="text-muted">A short description placeholder.</p>
            <div class="price">$${book.price.toFixed(2)}</div>
            <div style="margin-top:.5rem;">
              <button class="btn small add-product-btn" data-id="${book.id}"><i class="fa fa-cart-plus"></i> Add</button>
            </div>
          </div>
        `;
        productsGrid.appendChild(card);
      });

      productsGrid.addEventListener('click', function (e) {
        const btn = e.target.closest('.add-product-btn');
        if (!btn) return;
        const id = parseInt(btn.dataset.id);
        const book = window.bookCatalog.find(b => b.id === id);
        if (book) {
          window.cartManager.addItem(book, 1);
          alert(`Added "${book.title}" to cart.`);
        }
      });
    }

    // If add-to-cart buttons exist on index.html featured slider
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const id = parseInt(this.dataset.id);
        const book = window.bookCatalog.find(b => b.id === id) || {
          id: id,
          title: this.dataset.title || 'Book',
          price: parseFloat(this.dataset.price) || 0,
          img: this.dataset.img || './image/book-1.png'
        };
        window.cartManager.addItem(book, 1);
        alert(`Added "${book.title}" to cart.`);
      });
    });

    // Render cart items in sidebar
    const cartList = document.getElementById('cart-list');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const shippingEl = document.getElementById('cart-shipping');

    function renderCartUI(cart) {
      if (!cartList) return;
      cartList.innerHTML = '';
      if (!cart || !cart.length) {
        cartList.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
      } else {
        cart.forEach(item => {
          const row = document.createElement('div');
          row.className = 'cart-item';
          row.innerHTML = `
            <div class="left">
              <img src="${item.img}" alt="${item.title}">
              <div>
                <div><strong>${item.title}</strong></div>
                <div class="text-muted">$${item.price.toFixed(2)} each</div>
                <div style="margin-top:.5rem;">
                  <input class="qty-input" data-id="${item.id}" type="number" min="1" value="${item.qty}">
                  <button class="btn small remove-btn" data-id="${item.id}"><i class="fa fa-trash"></i></button>
                </div>
              </div>
            </div>
            <div class="right">
              <div><strong>$${(item.price * item.qty).toFixed(2)}</strong></div>
            </div>
          `;
          cartList.appendChild(row);
        });
      }
      if (subtotalEl) subtotalEl.textContent = window.cartManager.getSubtotal().toFixed(2);
      if (shippingEl) shippingEl.textContent = (window.cartManager.cart.length ? window.cartManager.shipping.toFixed(2) : "0.00");
      if (totalEl) totalEl.textContent = window.cartManager.getTotal().toFixed(2);
    }

    // initial render
    renderCartUI(window.cartManager.cart);

    // subscribe to cart changes
    window.cartManager.onChange(renderCartUI);

    // handle remove & qty change
    if (cartList) {
      cartList.addEventListener('click', function (e) {
        const rem = e.target.closest('.remove-btn');
        if (rem) {
          const id = parseInt(rem.dataset.id);
          window.cartManager.removeItem(id);
          return;
        }
      });
      cartList.addEventListener('change', function (e) {
        const qtyInput = e.target.closest('.qty-input');
        if (qtyInput) {
          const id = parseInt(qtyInput.dataset.id);
          const qty = parseInt(qtyInput.value) || 1;
          window.cartManager.setQty(id, qty);
        }
      });
    }

    // Stripe demo button
    const stripeBtn = document.getElementById('stripe-pay-btn');
    stripeBtn?.addEventListener('click', function () {
      const total = window.cartManager.getTotal();
      if (window.cartManager.cart.length === 0) { alert('Your cart is empty.'); return; }
      // simulate stripe validation flow
      const saved = JSON.parse(localStorage.getItem('booklet_user') || '{}');
      if (!saved.email) {
        if (!confirm('You are not signed in. Go to sign in page?')) {
          alert('Stripe demo canceled.');
          return;
        }
        location.href = 'signin.html';
        return;
      }
      alert(`Stripe demo: processed $${total.toFixed(2)} (demo). Thank you, ${saved.fullname || saved.email}`);
      window.cartManager.clearCart();
    });

    // Card demo button
    const cardPayBtn = document.getElementById('card-pay-btn');
    cardPayBtn?.addEventListener('click', function () {
      const total = window.cartManager.getTotal();
      if (window.cartManager.cart.length === 0) { alert('Your cart is empty.'); return; }
      const name = document.getElementById('card-name').value.trim();
      const number = document.getElementById('card-number').value.trim();
      const exp = document.getElementById('card-exp').value.trim();
      const cvc = document.getElementById('card-cvc').value.trim();
      if (!name || !number || !exp || !cvc) {
        alert('Please fill card details (demo).');
        return;
      }
      // very basic Luhn-like check (not real)
      if (number.replace(/\s+/g,'').length < 12) {
        alert('Card number looks invalid (demo).');
        return;
      }
      alert(`Card demo: processed $${total.toFixed(2)} (demo). Thank you, ${name}`);
      window.cartManager.clearCart();
    });
  });

  /* ------- Account sign-in & storage flow ------- */
  document.addEventListener('DOMContentLoaded', function () {
    // If signin form is present
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
      signinForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const fullname = document.getElementById('fullname').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        if (!fullname || !phone || !email || !password) {
          alert('Please fill all fields.');
          return;
        }
        const user = { fullname, phone, email };
        localStorage.setItem('booklet_user', JSON.stringify(user));
        // redirect to account page
        location.href = 'account.html';
      });
    }

    // Modal sign-in (index.html login modal)
    const modalForm = document.getElementById('modal-signin-form');
    if (modalForm) {
      modalForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const fullname = document.getElementById('modal-fullname').value.trim();
        const phone = document.getElementById('modal-phone').value.trim();
        const email = document.getElementById('modal-email').value.trim();
        const password = document.getElementById('modal-password').value;
        if (!email || !password) { alert('Please enter email and password.'); return; }
        const user = { fullname, phone, email };
        localStorage.setItem('booklet_user', JSON.stringify(user));
        alert('Signed in (demo).');
        loginform.classList.remove('active');
      });
    }
  });

})();

// Add book to favorites
const favButtons = document.querySelectorAll(".add-fav");

favButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const title = btn.dataset.title;
        const img = btn.dataset.img;

        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

        // Check if already in favorites
        if (!favorites.some(fav => fav.title === title)) {
            favorites.push({title, img});
            localStorage.setItem("favorites", JSON.stringify(favorites));
            alert(`${title} added to favorites!`);
        } else {
            alert(`${title} is already in favorites`);
        }
    });
});

// Show favorites when top heart is clicked
const topHeart = document.querySelector(".fa-heart"); // the header heart
topHeart.addEventListener("click", () => {
    window.location.href = "favorites.html";
});
