import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './layouts/mainLayout.tsx';
import AuthLayout from './layouts/authLayout.tsx';
import Layout from './layouts/layout.tsx';

import { Login } from './pages/auth/login.tsx';
import { Register } from './pages/auth/register.tsx';
import { Chats } from './pages/chats.tsx';
import { ArchivedChats } from './pages/archivedChats.tsx';

const client = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: '',
        element: <MainLayout />,
        children: [
          {
            path: '',
            element: <Chats />,
          },
          {
            path: '/archived',
            element: <ArchivedChats />
          },
          {
            path: "/new",
            element: <Chats />
          }
        ]
      },
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <Login />
          },
          {
            path: "register",
            element: <Register />
          }
        ]
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={client} />
  </StrictMode>,
)
