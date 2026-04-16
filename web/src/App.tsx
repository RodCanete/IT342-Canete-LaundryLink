import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ShopsPage from './pages/ShopsPage'
import ShopDetailPage from './pages/ShopDetailPage'
import BookPage from './pages/BookPage'
import BookingsPage from './pages/BookingsPage'
import ConfirmationPage from './pages/ConfirmationPage'
import CustomerDashboardPage from './pages/CustomerDashboardPage'
import ShopOwnerDashboardPage from './pages/ShopOwnerDashboardPage'
import AdminLayoutRoute from './pages/AdminLayoutRoute'
import AdminPage from './pages/AdminPage'
import AdminSlotsPage from './pages/AdminSlotsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/shops" element={<ShopsPage />} />
      <Route path="/shops/:id" element={<ShopDetailPage />} />
      <Route path="/shops/:id/book" element={<BookPage />} />
      <Route path="/bookings" element={<BookingsPage />} />
      <Route path="/bookings/confirmation" element={<ConfirmationPage />} />
      <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
      <Route path="/shop-owner/dashboard" element={<ShopOwnerDashboardPage />} />
      <Route path="/admin" element={<AdminLayoutRoute />}>
        <Route index element={<AdminPage />} />
        <Route path="slots" element={<AdminSlotsPage />} />
      </Route>
    </Routes>
  )
}
