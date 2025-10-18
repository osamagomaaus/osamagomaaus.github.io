// ========== Cart Functions ==========
function renderCart() {
  const cartContainer = document.getElementById('cart-container');
  const totalElement = document.getElementById('cart-total');
  if (!cartContainer) return;

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cartContainer.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p style="text-align:center; color:#555;">Your cart is empty.</p>';
    totalElement.textContent = 'Total: $0.00';
    return;
  }

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <div class="content">
        <h3>${item.title}</h3>
        <p>Price: $${item.price.toFixed(2)}</p>
        <input type="number" class="quantity" min="1" value="${item.quantity}" data-index="${index}">
        <button class="remove-btn" data-index="${index}">Remove</button>
      </div>
    `;
    cartContainer.appendChild(div);
  });

  totalElement.textContent = `Total: $${total.toFixed(2)}`;
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ========== Quantity Update ==========
document.addEventListener('input', e => {
  if (e.target.classList.contains('quantity')) {
    const index = e.target.dataset.index;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity = Math.max(1, parseInt(e.target.value) || 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }
});

// ========== Remove Item ==========
document.addEventListener('click', e => {
  if (e.target.classList.contains('remove-btn')) {
    const index = e.target.dataset.index;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }
});

// ========== PayPal ==========
function renderPayPalButton() {
  const container = document.getElementById('paypal-button-container');
  if (!container) return;
  container.innerHTML = ''; // Clear previous buttons
  paypal.Buttons({
    createOrder: (data, actions) => {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return actions.order.create({ purchase_units: [{ amount: { value: total.toFixed(2) } }] });
    },
    onApprove: (data, actions) => {
      return actions.order.capture().then(details => {
        alert('Transaction completed by ' + details.payer.name.given_name + '!');
        localStorage.removeItem('cart');
        renderCart();
        renderPayPalButton();
      });
    }
  }).render('#paypal-button-container');
}

// ========== Init ==========
renderCart();
renderPayPalButton();
