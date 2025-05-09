import { gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const GET_ORDERS = gql`
  query {
    orders {
      id
      user {
        id
        name
      }
      product {
        id
        name
      }
      quantity
      status
    }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
    }
  }
`;

const UPDATE_ORDER = gql`
  mutation UpdateOrder($input: UpdateOrderInput!) {
    updateOrder(input: $input) {
      id
    }
  }
`;

const DELETE_ORDER = gql`
  mutation DeleteOrder($id: ID!) {
    deleteOrder(id: $id)
  }
`;

function OrdersPage() {
  const { loading, error, data, refetch } = useQuery(GET_ORDERS);
  const [createOrder] = useMutation(CREATE_ORDER);
  const [updateOrder] = useMutation(UPDATE_ORDER);
  const [deleteOrder] = useMutation(DELETE_ORDER);

  const [newOrder, setNewOrder] = useState({
    userId: '',
    productId: '',
    quantity: 1,
    status: 'PENDING'
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    userId: '',
    productId: '',
    quantity: 1,
    status: 'PENDING'
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    await createOrder({ variables: { input: newOrder } });
    setNewOrder({ userId: '', productId: '', quantity: 1, status: 'PENDING' });
    refetch();
  };

  const handleUpdate = async (id) => {
    await updateOrder({ variables: { input: { id, ...editData } } });
    setEditingId(null);
    refetch();
  };

  const handleDelete = async (id) => {
    await deleteOrder({ variables: { id } });
    refetch();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="page-container">
      <h1 className="page-title">Orders</h1>

      <form className="form" onSubmit={handleCreate}>
        <input
          className="input"
          type="text"
          placeholder="User ID"
          value={newOrder.userId}
          onChange={(e) => setNewOrder({ ...newOrder, userId: e.target.value })}
        />
        <input
          className="input"
          type="text"
          placeholder="Product ID"
          value={newOrder.productId}
          onChange={(e) => setNewOrder({ ...newOrder, productId: e.target.value })}
        />
        <input
          className="input"
          type="number"
          placeholder="Quantity"
          value={newOrder.quantity}
          onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) })}
        />
        <select
          className="input"
          value={newOrder.status}
          onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
        >
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="SHIPPED">SHIPPED</option>
        </select>
        <button className="button" type="submit">Add Order</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>
                {editingId === order.id ? (
                  <input
                    type="text"
                    value={editData.userId}
                    onChange={(e) => setEditData({ ...editData, userId: e.target.value })}
                  />
                ) : (
                  `${order.user?.name || 'N/A'} (#${order.user?.id || ''})`
                )}
              </td>
              <td>
                {editingId === order.id ? (
                  <input
                    type="text"
                    value={editData.productId}
                    onChange={(e) => setEditData({ ...editData, productId: e.target.value })}
                  />
                ) : (
                  `${order.product?.name || 'N/A'} (#${order.product?.id || ''})`
                )}
              </td>
              <td>
                {editingId === order.id ? (
                  <input
                    type="number"
                    value={editData.quantity}
                    onChange={(e) =>
                      setEditData({ ...editData, quantity: parseInt(e.target.value) })
                    }
                  />
                ) : (
                  order.quantity
                )}
              </td>
              <td>
                {editingId === order.id ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPED">SHIPPED</option>
                  </select>
                ) : (
                  order.status
                )}
              </td>
              <td>
                {editingId === order.id ? (
                  <>
                    <button className="button blue" onClick={() => handleUpdate(order.id)}>
                      Save
                    </button>
                    <button className="button gray" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="button blue"
                      onClick={() => {
                        setEditingId(order.id);
                        setEditData({
                          userId: order.user?.id || '',
                          productId: order.product?.id || '',
                          quantity: order.quantity,
                          status: order.status
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button className="button red" onClick={() => handleDelete(order.id)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="back-link">
        <Link to="/">← Back to Home</Link>
      </p>
    </div>
  );
}

export default OrdersPage;