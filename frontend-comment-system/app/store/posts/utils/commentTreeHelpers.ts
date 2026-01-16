import type { Comment } from '../postSlice';   // ← adjust path to your slice

export const addCommentToTree = (
    comments: Comment[],
    newComment: Comment
): Comment[] => {
    if (!newComment.parent) {
        return [newComment, ...comments];
    }

    return comments.map((comment) => {
        if (comment._id === newComment.parent) {
            return {
                ...comment,
                children: [...(comment.children || []), newComment],
            };
        }

        if (comment.children?.length) {
            return {
                ...comment,
                children: addCommentToTree(comment.children, newComment),
            };
        }

        return comment;
    });
};

export const updateCommentInTree = (
    comments: Comment[],
    commentId: string,
    updater: (c: Comment) => Comment
): Comment[] =>
    comments.map((c) => {
        if (c._id === commentId) return updater(c);
        if (c.children?.length) {
            return { ...c, children: updateCommentInTree(c.children, commentId, updater) };
        }
        return c;
    });

export const removeCommentFromTree = (
    comments: Comment[],
    commentId: string
): Comment[] =>
    comments
        .filter((c) => c._id !== commentId)
        .map((c) => ({
            ...c,
            children: c.children ? removeCommentFromTree(c.children, commentId) : [],
        }));