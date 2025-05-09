import { gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const GET_USERS = gql`
  query {
    users {
      id
      name
      email
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      email
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

function UsersPage() {
  const { loading, error, data, refetch } = useQuery(GET_USERS);
  const [createUser] = useMutation(CREATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);

  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', email: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    await createUser({ variables: { input: newUser } });
    setNewUser({ name: '', email: '' });
    refetch();
  };

  const handleUpdate = async (id) => {
    await updateUser({ variables: { input: { id, ...editData } } });
    setEditingId(null);
    refetch();
  };

  const handleDelete = async (id) => {
    await deleteUser({ variables: { id } });
    refetch();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="page-container">
      <h1 className="page-title">Users</h1>
      <form className="form" onSubmit={handleCreate}>
        <input
          className="input"
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <button className="button" type="submit">Add User</button>
      </form>

      <table className="table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Email</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {data.users.map((user) => (
      <tr key={user.id}>
        <td>{user.id}</td>
        <td>
          {editingId === user.id ? (
            <input
              type="text"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />
          ) : (
            user.name
          )}
        </td>
        <td>
          {editingId === user.id ? (
            <input
              type="email"
              value={editData.email}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
            />
          ) : (
            user.email
          )}
        </td>
        <td>
          {editingId === user.id ? (
            <>
              <button className="button blue" onClick={() => handleUpdate(user.id)}>
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
                  setEditingId(user.id);
                  setEditData({ name: user.name, email: user.email });
                }}
              >
                Edit
              </button>
              <button className="button red" onClick={() => handleDelete(user.id)}>
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
        <Link to="/">← Back to home</Link>
      </p>
    </div>
  );
}

export default UsersPage;