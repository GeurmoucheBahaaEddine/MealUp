import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import DishDetails from './pages/DishDetails';
import AdminDashboard from './pages/admin/AdminDashboard';
import Reports from './pages/admin/Reports';
import ActivityLog from './pages/admin/ActivityLog';
import PromoCodes from './pages/admin/PromoCodes';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDishes from './pages/admin/AdminDishes';
import EditDish from './pages/admin/EditDish';
import Users from './pages/admin/Users';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import ServerError from './pages/ServerError';

function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/dish/:id" element={<DishDetails />} /> {/* Added DishDetails route */}

                    <Route path="/cart" element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    } />

                    <Route path="/orders" element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    } />

                    <Route path="/favorites" element={
                        <ProtectedRoute>
                            <Favorites />
                        </ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />

                    {/* Admin Routes with Layout */}
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="activity-log" element={<ActivityLog />} />
                        <Route path="promocodes" element={<PromoCodes />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="dishes" element={<AdminDishes />} />
                        <Route path="users" element={<Users />} />
                        <Route path="edit-dish/:id" element={<EditDish />} />
                    </Route>

                    {/* Error Pages */}
                    <Route path="/403" element={<Forbidden />} />
                    <Route path="/500" element={<ServerError />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
