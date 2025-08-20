document.addEventListener('DOMContentLoaded', () => {
  const cartId = document.body.dataset.cartId;


  function showAlert(message, type = 'success', timeout = 2000) {
    const alertWrapper = document.createElement('div');
    alertWrapper.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 1055;">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    document.body.appendChild(alertWrapper);
    setTimeout(() => {
      bootstrap.Alert.getOrCreateInstance(alertWrapper.querySelector('.alert')).close();
    }, timeout);
  }


  function updateCartCounter(increment = 1) {
    const counter = document.getElementById('cart-counter');
    if (counter) {
      counter.textContent = parseInt(counter.textContent || 0) + increment;
    }
  }


  async function addToCart(productId, btn) {
    try {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Procesando...';
      }

      const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Error al agregar al carrito');

      updateCartCounter(1);
      showAlert('Producto agregado al carrito', 'success');

    } catch (err) {
      console.error(err);
      showAlert(err.message, 'danger');
    } finally {
      if (btn) btn.innerHTML = '<i class="fas fa-cart-plus me-1"></i> Agregar';
      if (btn) btn.disabled = false;
    }
  }

  document.querySelectorAll('.add-to-cart-btn, .btn-lg').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = button.dataset.productId || button.getAttribute('onclick')?.match(/'(.+?)'/)[1];
      if (!productId) return;
      addToCart(productId, button);
    });
  });
  if (window.location.pathname.startsWith('/carts') && cartId) {
    async function updateQuantity(productId, quantity) {
      const res = await fetch(`/api/carts/${cartId}/product/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (res.ok) location.reload();
      else console.error(await res.json());
    }

    document.querySelectorAll('.increase-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const productId = row.dataset.productId;
        let qty = parseInt(row.querySelector('.quantity').textContent) + 1;
        updateQuantity(productId, qty);
      });
    });

    document.querySelectorAll('.decrease-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const productId = row.dataset.productId;
        let qty = parseInt(row.querySelector('.quantity').textContent) - 1;
        if (qty < 1) return;
        updateQuantity(productId, qty);
      });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('tr');
        const productId = row.dataset.productId;
        await fetch(`/api/carts/${cartId}/product/${productId}`, { method: 'DELETE' });
        location.reload();
      });
    });

    document.querySelector('.clear-cart-btn')?.addEventListener('click', async () => {
      await fetch(`/api/carts/${cartId}`, { method: 'DELETE' });
      location.reload();
    });
  }
  window.addToCart = addToCart;
});
