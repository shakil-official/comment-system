import { Link } from "react-router";

type AuthRedirectLinkProps = {
    text: string;
    linkText: string;
    to: string;
};

export default function AuthRedirectLink({
                                             text,
                                             linkText,
                                             to,
                                         }: AuthRedirectLinkProps) {
    return (
        <p className="text-sm text-center mt-4 text-gray-600">
            {text}{" "}
            <Link
                to={to}
                className="text-blue-600 hover:underline font-medium"
            >
                {linkText}
            </Link>
        </p>
    );
}
