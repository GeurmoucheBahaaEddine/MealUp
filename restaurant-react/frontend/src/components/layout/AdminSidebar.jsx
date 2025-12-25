import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUtensils, FaClipboardList, FaUsersCog, FaChartLine, FaHistory, FaTag, FaChevronLeft, FaChevronRight, FaBars, FaTimes, FaList, FaBoxes } from 'react-icons/fa';

const AdminSidebar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { path: '/admin/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
        { path: '/admin/reports', icon: FaChartLine, label: 'Rapports' },
        { path: '/admin/dishes', icon: FaUtensils, label: 'Gestion Plats' },
        { path: '/admin/orders', icon: FaClipboardList, label: 'Commandes' },
        { path: '/admin/users', icon: FaUsersCog, label: 'Utilisateurs' },
        { path: '/admin/activity-log', icon: FaHistory, label: 'Journal d\'activité' },
        { path: '/admin/promocodes', icon: FaTag, label: 'Codes Promo' },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform focus:outline-none"
            >
                {isOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:relative inset-y-0 left-0 z-40
                w-64 bg-white shadow-xl min-h-screen transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 sticky top-0">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-primary text-white shadow-md transform scale-[1.02]'
                                        : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                                        }`}
                                >
                                    <Icon className="text-xl" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;
