import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Auth check (adjust key name if needed)
        const token = localStorage.getItem("token");
        setIsAuthenticated(Boolean(token));
    }, []);

    const handleLogout = () => {
        const token = localStorage.getItem("token");

        // Prevent invalid logout
        if (!token) {
            navigate("/login");
            return;
        }

        // Clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setIsAuthenticated(false);
        navigate("/login");
    };

    return (
        <header className="w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                <Link
                    to="/"
                    className="text-xl font-bold text-blue-600"
                >
                    Commenting System
                </Link>

                {/* Menu */}
                <nav className="flex items-center gap-6 text-sm font-medium">
                    <Link
                        to="/"
                        className="text-gray-700 hover:text-blue-600 transition"
                    >
                        Home
                    </Link>

                    <Link
                        to="/login"
                        className="text-gray-700 hover:text-blue-600 transition"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="text-gray-700 hover:text-blue-600 transition"
                    >
                        Register
                    </Link>


                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="px-4 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition"
                        >
                            Logout
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
