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
    date?: string;
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
