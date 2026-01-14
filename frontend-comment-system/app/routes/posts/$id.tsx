import React from "react";
import {useParams} from "react-router";


type Post = {
    id: string;
    title: string;
    description: string;
};

const posts: Post[] = [
    {
        id: "1",
        title: "Mastering React 18",
        description:
            "React 18 introduced several new features including concurrent rendering, automatic batching, and the new root API...",
    },
    {
        id: "2",
        title: "Tailwind CSS Tips",
        description:
            "Tailwind CSS is a utility-first CSS framework that allows you to rapidly build custom designs...",
    },
];

export default function PostDetail() {
    const { id } = useParams<{ id: string }>();

    const post = posts.find((p) => p.id === id);

    if (!post) {
        return <p className="text-center mt-10 text-red-500">Post not found</p>;
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <p className="text-gray-700 leading-relaxed">{post.description}</p>
        </div>
    );
}
