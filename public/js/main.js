document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const productId = button.dataset.productId;
      const cartId = document.body.dataset.cartId;

      try {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Error al agregar al carrito');


        const counter = document.getElementById('cart-counter');
        if (counter) {
          counter.textContent = parseInt(counter.textContent || '0') + 1;
        }

        showAlert('Producto agregado al carrito', 'success');
      } catch (error) {
        showAlert(error.message, 'danger');
      } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar';
      }
    });
  });
});

function showAlert(message, type) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
  alert.style.zIndex = '1000';
  alert.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle me-2"></i>
    ${message}
  `;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}