import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "~/store";
import { fetchPostsRequest } from "~/store/posts/postSlice";
import PostList from "~/components/PostList";

export default function PostListContainer() {
    const dispatch = useDispatch();
    const {
        posts,
        postsLoading,
        postsError,
        postsPage,
        postsTotalPages,
    } = useSelector((state: RootState) => state.posts);

    useEffect(() => {
        // Fetch first page
        dispatch(fetchPostsRequest({ page: 1 }));
    }, [dispatch]);

    const handlePrev = () => {
        if (postsPage > 1) dispatch(fetchPostsRequest({ page: postsPage - 1 }));
    };

    const handleNext = () => {
        if (postsPage < postsTotalPages)
            dispatch(fetchPostsRequest({ page: postsPage + 1 }));
    };

    // Map backend _id → frontend id
    const mappedPosts = posts.map((p: any) => ({
        id: p._id,
        title: p.title,
        description: p.description,
        date: p.date,
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Error */}
            {postsError && (
                <div className="flex justify-center mb-4">
                    <p className="text-red-500">{postsError}</p>
                </div>
            )}

            {/* Posts or Skeleton */}
            {postsLoading && posts.length === 0 ? (
                <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse h-64"
                        >
                            <div className="p-6 flex flex-col h-full justify-between">
                                <div className="h-6 bg-gray-300 rounded mb-3 w-3/4"></div>
                                <div className="h-4 bg-gray-300 rounded mb-2 w-full"></div>
                                <div className="h-4 bg-gray-300 rounded mb-2 w-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-5/6 mt-auto"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <PostList posts={mappedPosts} />
            )}

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-8">
                <button
                    onClick={handlePrev}
                    disabled={postsPage === 1 || postsLoading}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    ← Previous
                </button>

                <span className="px-2 py-2 text-gray-700">
                    Page {postsPage} of {postsTotalPages}
                </span>

                <button
                    onClick={handleNext}
                    disabled={postsPage === postsTotalPages || postsLoading}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
