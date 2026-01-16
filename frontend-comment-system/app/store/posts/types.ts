export interface Comment {
    _id: string;
    message: string;
    user?: {
        _id: string;
        name: string;
        email: string;
    };
    parent?: string | null;
    post: string;
    favorites?: string[];
    dislikes?: string[];
    createdAt?: string;
    updatedAt?: string;
    children?: Comment[];
}

export interface Post {
    _id: string;
    title: string;
    description: string;
    user?: {
        _id: string;
        name: string;
        email: string;
    };
    status?: "active" | "inactive";
    date?: string;
}
