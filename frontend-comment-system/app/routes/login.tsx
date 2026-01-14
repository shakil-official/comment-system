import React, {type FormEvent, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {loginRequest} from "~/store/auth/authSlice";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const {loading, user} = useSelector((state: any) => state.auth);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        dispatch(loginRequest({email, password}));
    };

    useEffect(() => {
        if (user?.token) {
            navigate("/"); // Redirect after login
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-lg shadow-lg p-8"
            >
                <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

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
                    className="w-full px-4 py-2 mb-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
