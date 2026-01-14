import React from "react";

type Post = {
    id: string;
    title: string;
    description: string;
    category?: string;
    date?: string; // ISO string or formatted date
};

type Props = {
    posts: Post[];
};

export default function PostList({ posts }: Props) {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Latest Posts</h1>

            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition duration-300 ease-in-out cursor-pointer flex flex-col justify-between">


                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <h2 className="text-2xl font-semibold mb-3 text-gray-900 hover:text-blue-600 transition">
                                {post.title}
                            </h2>
                            <p className="text-gray-700 mb-4 flex-1 text-sm leading-relaxed">
                                {post.description.length > 200
                                    ? post.description.slice(0, 200) + "..."
                                    : post.description}
                            </p>

                            {/* Read More */}
                            <div className="mt-auto">
                                <a
                                    href={`/posts/${post.id}`}
                                    className="text-blue-600 font-medium hover:underline text-sm"
                                >
                                    Read More →
                                </a>
                            </div>
                        </div>

                        {/* Footer */}
                        {post.date && (
                            <div className="px-6 py-3 bg-gray-50 text-gray-500 text-xs">
                                {new Date(post.date).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
