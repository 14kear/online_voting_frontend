import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import Login from './components/Login'
import Register from './components/Register'
import Votes from './components/Votings'
import VotePage from './components/VotePage'
import AdminPage from './components/AdminPage'
import EditPoll from './components/EditPoll'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Votes/>
      },
      { 
        path: "login",
        element: <Login /> 
      },
      { 
        path: "register",
        element: <Register /> 
      },
      {
        path: "vote/:id",
        element: <VotePage />
      },
      {
        path: "admin", 
        element: <AdminPage />
      },
      {
        path: "edit-vote/:id",
        element: <EditPoll />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
