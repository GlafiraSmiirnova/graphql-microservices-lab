import { Link } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="container">
      <h1 className="title">Our Small Microservices System</h1>
      <ul className="nav-list">
        <li><Link className="nav-link" to="/users">👤 Users</Link></li>
        <li><Link className="nav-link" to="/products">📦 Products</Link></li>
        <li><Link className="nav-link" to="/orders">🛒 Orders</Link></li>
      </ul>
    </div>
  )
}

export default App
