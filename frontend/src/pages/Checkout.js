import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  // Calculate total price
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Place order handler
  const handlePlaceOrder = async () => {
    if (!email) {
      alert('Please enter your email before placing the order.');
      return;
    }

    try {
      const response = await fetch('https://blum-backend.onrender.com/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: email,
          items: cart,
          total,
        }),
      });

      if (response.ok) {
        // Clear cart from localStorage
        localStorage.removeItem('cart');
        // Redirect to success page
        navigate('/success');
      } else {
        console.error('Failed to place order');
        alert('Something went wrong while placing your order.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Server error. Please try again later.');
    }
  };

  return (
    <div className="checkout-container">
      <h2>Order Summary</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map(item => (
              <li key={item._id}>
                {item.name} x{item.quantity} = ${item.price * item.quantity}
              </li>
            ))}
          </ul>

          <p><strong>Total:</strong> ${total.toFixed(2)}</p>

          <label style={{ display: 'block', marginBottom: '10px' }}>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginLeft: '10px', padding: '5px', width: '250px' }}
              placeholder="you@example.com"
            />
          </label>

          <button onClick={handlePlaceOrder}>Place Order</button>
        </>
      )}
    </div>
  );
};

export default Checkout;
