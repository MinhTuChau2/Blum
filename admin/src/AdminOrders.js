import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    axios.get('https://blum-backend.onrender.com/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Error fetching orders:', err));
  };

  const handleStatusChange = (orderId, newStatus) => {
    axios.put(`https://blum-backend.onrender.com/orders/${orderId}/status`, { status: newStatus })
      .then(() => {
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      })
      .catch(err => console.error('Error updating order status:', err));
  };

  const handleDelete = (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    axios.delete(`https://blum-backend.onrender.com/orders/${orderId}`)
      .then(() => {
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      })
      .catch(err => {
        console.error('Error deleting order:', err);
        alert('Failed to delete order.');
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <div className="admin-orders-container">
  <h2>All Orders</h2>
  {orders.length === 0 ? (
    <p>No orders found.</p>
  ) : (
    <ul className="admin-orders-list">
      {orders.map(order => (
        <li key={order._id}>
          <strong>Order ID:</strong> {order._id}<br />
          <strong>Email:</strong> {order.customerEmail}<br />
          <strong>Status:</strong>{' '}
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(order._id, e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="received">Received</option>
            <option value="sent">Sent</option>
          </select>
          <br />
          <strong>Items:</strong>
          <ul>
            {order.items.map((item, index) => (
              <li key={item._id || index}>
                {item.name} x {item.quantity} - ${item.price * item.quantity}
              </li>
            ))}
          </ul>
          <strong>Total:</strong> ${order.total.toFixed(2)}<br />
          <strong>Placed At:</strong> {new Date(order.createdAt).toLocaleString()}
          <br />
          <button
            className="admin-orders-delete-btn"
            onClick={() => handleDelete(order._id)}
          >
            Delete Order
          </button>
          <hr />
        </li>
      ))}
    </ul>
  )}
</div>

    </div>
  );
};

export default AdminOrders;
