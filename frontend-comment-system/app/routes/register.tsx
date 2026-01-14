import React, {useState, useEffect, type FormEvent} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {toast} from "react-hot-toast";
import {registerRequest} from "~/store/auth/authSlice";
import AuthRedirectLink from "~/components/AuthRedirectLink";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const {loading, user} = useSelector((state: any) => state.auth);

    const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const validatePassword = (value: string) => /^\d{6}$/.test(value);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!email) return toast.error("Email is required");
        if (!validateEmail(email)) return toast.error("Enter a valid email address");
        if (!password) return toast.error("Password is required");
        if (!validatePassword(password)) return toast.error("Password must be exactly 6 digits");
        if (!confirmPassword) return toast.error("Confirm password is required");
        if (password !== confirmPassword) return toast.error("Passwords do not match");

        dispatch(registerRequest({name, email, password}));
    };

    // Redirect if logged in
    useEffect(() => {
        if (user?.token) {
            navigate("/"); // Redirect after registration/login
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>

                <input
                    type="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="password"
                    placeholder="6-digit Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-2 mb-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                <AuthRedirectLink text="Already have an account?" linkText="Login" to="/login"/>
            </form>
        </div>
    );
}
