document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.add-to-cart-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const productCode = form.querySelector('input[name="productCode"]').value;
      let quantity = form.querySelector('input[name="quantity"]');
      let size = form.querySelector('input[name="size"]:checked');

      // If quantity and size are not provided in the form, use default values
      quantity = quantity ? quantity.value : 1;
      size = size ? size.value : 'XS';
      
      try {
        const response = await fetch('/add-to-cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productCode,quantity, size  }),
          credentials: 'include'
        });

        if (response.status === 401) {
          // If the user is not authenticated, store the current URL and the productCode in the session storage
          sessionStorage.setItem('redirectUrl', window.location.href);
          sessionStorage.setItem('productCode', productCode);
          // Redirect to the login page
          window.location.href = '/login';
        } else if (response.ok) {
          // Show success notification
          document.getElementById('notification').innerText = 'Product added to cart successfully!';
          document.getElementById('notification').style.backgroundColor = 'green';
          document.getElementById('notification').style.display = 'block';
          setTimeout(() => {
            document.getElementById('notification').style.display = 'none';
          }, 3000); // Hide notification after 3 seconds
        } else {
          // Show error notification
          document.getElementById('notification').innerText = 'Failed to add product to cart';
          document.getElementById('notification').style.backgroundColor = 'red';
          document.getElementById('notification').style.display = 'block';
          setTimeout(() => {
            document.getElementById('notification').style.display = 'none';
          }, 3000); // Hide notification after 3 seconds
        }
      } catch (err) {
        console.error('Network error:', err);
        // Show network error notification
        document.getElementById('notification').innerText = 'Network error';
        document.getElementById('notification').style.backgroundColor = 'red';
        document.getElementById('notification').style.display = 'block';
        setTimeout(() => {
          document.getElementById('notification').style.display = 'none';
        }, 3000); // Hide notification after 3 seconds
      }
    });
  });

  // After the page loads, check if there's a productCode in the session storage
  const productCode = sessionStorage.getItem('productCode');
  if (productCode) {
    // If there is, try to add the product to the cart again
    fetch('/add-to-cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productCode }),
      credentials: 'include'
    })
    .then(response => {
      if (response.status === 401) {
        // If the user is not authenticated, redirect to the login page
        window.location.href = '/login';
      } else if (response.ok) {
        // Show success notification
        document.getElementById('notification').innerText = 'Product added to cart successfully!';
        document.getElementById('notification').style.backgroundColor = 'green';
        document.getElementById('notification').style.display = 'block';
        setTimeout(() => {
          document.getElementById('notification').style.display = 'none';
        }, 3000); // Hide notification after 3 seconds
      } else {
        // Show error notification
        document.getElementById('notification').innerText = 'Failed to add product to cart';
        document.getElementById('notification').style.backgroundColor = 'red';
        document.getElementById('notification').style.display = 'block';
        setTimeout(() => {
          document.getElementById('notification').style.display = 'none';
        }, 3000); // Hide notification after 3 seconds
      }
    })
    .catch(err => {
      console.error('Network error:', err);
      // Show network error notification
      document.getElementById('notification').innerText = 'Network error';
      document.getElementById('notification').style.backgroundColor = 'red';
      document.getElementById('notification').style.display = 'block';
      setTimeout(() => {
        document.getElementById('notification').style.display = 'none';
      }, 3000); // Hide notification after 3 seconds
    });

    // Remove the productCode from the session storage
    sessionStorage.removeItem('productCode');
  }
});