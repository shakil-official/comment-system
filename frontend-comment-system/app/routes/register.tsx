import {useState} from "react";
import {Link} from "react-router";
import toast from "react-hot-toast";
import AuthRedirectLink from "~/components/AuthRedirectLink";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const validateEmail = (value: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const validatePassword = (value: string) =>
        /^\d{6}$/.test(value);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) return toast.error("Email is required");
        if (!validateEmail(email))
            return toast.error("Enter a valid email address");

        if (!password) return toast.error("Password is required");
        if (!validatePassword(password))
            return toast.error("Password must be exactly 6 digits");

        if (!confirmPassword)
            return toast.error("Confirm password is required");

        if (password !== confirmPassword)
            return toast.error("Passwords do not match");

        toast.success("Registration successful");
        console.log({email, password});
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-lg shadow-lg p-8"
            >
                <h2 className="text-2xl font-semibold text-center mb-6">
                    Register
                </h2>

                <div className="mb-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <input
                        type="password"
                        placeholder="6-digit Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        maxLength={6}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        maxLength={6}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
                >
                    Register
                </button>

                {/* Login Link */}
                <AuthRedirectLink
                    text="Already have an account?"
                    linkText="Login"
                    to="/login"
                />

            </form>
        </div>
    );
}
