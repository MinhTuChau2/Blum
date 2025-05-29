// Cart.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = ({ cart, removeFromCart }) => {
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <ul>
          {cart.map(item => (
            <li key={item._id || item.id}>
              {item.name} x{item.quantity} - ${ (item.price * item.quantity).toFixed(2) }
              <button onClick={() => removeFromCart(item._id || item.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      <p><strong>Total:</strong> ${total.toFixed(2)}</p>
      {cart.length > 0 && (
        <button
          onClick={() => navigate('/checkout')}
          className="checkout-btn"
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
};

export default Cart;
