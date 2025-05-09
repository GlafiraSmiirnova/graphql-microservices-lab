import { gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const GET_PRODUCTS = gql`
  query {
    products {
      id
      name
      price
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      price
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      id
      name
      price
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

function ProductsPage() {
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', price: 0 });
  const [editData, setEditData] = useState({ name: '', price: 0 });

  const handleCreate = async (e) => {
    e.preventDefault();
    await createProduct({ variables: { input: form } });
    setForm({ name: '', price: 0 });
    refetch();
  };

  const handleUpdate = async (id) => {
    await updateProduct({ variables: { input: { id, ...editData } } });
    setEditingId(null);
    refetch();
  };

  const handleDelete = async (id) => {
    await deleteProduct({ variables: { id } });
    refetch();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditData({ name: product.name, price: product.price });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading products.</p>;

  return (
    <div className="page-container">
      <h1 className="page-title">Products</h1>

      <form className="form" onSubmit={handleCreate}>
        <input
          className="input"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="input"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
          required
        />
        <button className="button" type="submit">Add Product</button>
      </form>

      <table className="table">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Price</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {data.products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                {editingId === product.id ? (
                  <input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                ) : (
                  product.name
                )}
              </td>
              <td>
                {editingId === product.id ? (
                  <input
                    type="number"
                    value={editData.price}
                    onChange={(e) =>
                      setEditData({ ...editData, price: parseFloat(e.target.value) })}
                  />
                ) : (
                  product.price
                )}
              </td>
              <td>
                {editingId === product.id ? (
                  <>
                    <button className="button blue" onClick={() => handleUpdate(product.id)}>Save</button>
                    <button className="button gray" onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="button blue" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="button red" onClick={() => handleDelete(product.id)}>Delete</button>
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

export default ProductsPage;