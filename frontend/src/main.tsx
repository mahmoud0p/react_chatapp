import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { QueryClient , QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { store } from './app/store'
import { Provider } from 'react-redux'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
const queryClient = new QueryClient()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>

  </React.StrictMode>,
)
