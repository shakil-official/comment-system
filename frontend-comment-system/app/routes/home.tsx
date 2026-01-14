import type {Route} from "./+types/home";
import PostList from "~/components/PostList";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "New React Router App"},
        {name: "description", content: "Welcome to React Router!"},
    ];
}
const posts = [
    {
        id: "1",
        title: "Mastering React 18",
        description:
            "React 18 introduced several new features including concurrent rendering, automatic batching, and the new root API. In this guide, we'll cover how to effectively use these features in your modern React applications to improve performance and developer experience...",

        date: "2026-01-14T10:00:00Z",
    },
    {
        id: "2",
        title: "Tailwind CSS Tips",
        description:
            "Tailwind CSS is a utility-first CSS framework that allows you to rapidly build custom designs without leaving your HTML. Learn the best practices for responsive layouts, typography, and theming in Tailwind CSS for modern web projects...",
        date: "2026-01-13T14:30:00Z",
    },
];




export default function Home() {
    return (
        <>

            <PostList posts={posts}></PostList>

        </>
    );
}
