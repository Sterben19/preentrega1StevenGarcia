
let currentCartId = localStorage.getItem('cartId') || '';

async function getOrCreateCart() {
  if (!currentCartId) {
    try {
      const response = await fetch('/api/carts', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        currentCartId = data.payload._id;
        localStorage.setItem('cartId', currentCartId);
      }
    } catch (error) {
      console.error('Error al crear carrito:', error);
    }
  }
  return currentCartId;
}


document.addEventListener('DOMContentLoaded', () => {
  getOrCreateCart();
});