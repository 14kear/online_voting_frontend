import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      
      <main className="content">
        <Outlet /> {/* Основной контент страниц */}
      </main>
    </div>
  )
}

export default App