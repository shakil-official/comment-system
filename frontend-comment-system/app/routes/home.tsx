import type {Route} from "./+types/home";
import PostList from "~/components/PostList";
import PostListContainer from "~/components/PostListContainer";
import Header from "~/components/Header";
import React from "react";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "New React Router App"},
        {name: "description", content: "Welcome to React Router!"},
    ];
}


export default function Home() {
    return (
        <>

            <Header/>
            <PostListContainer/>

        </>
    );
}
