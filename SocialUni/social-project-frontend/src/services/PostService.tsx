import axios from "axios";

const API_URL = "http://localhost:8080/api/posts";

export interface Post {
    id: number;
    title: string;
    content: string;
    authorId: number;
    groupId: number;
    categories: string[];
    createdAt: string;
}

class PostService {
    /**
     * Fetch the user's news feed (posts from groups they are in).
     */
    getUserFeed(userId: number) {
        return axios.get<Post[]>(`${API_URL}/feed/${userId}`);
    }

    /**
     * Fetch the user's paginated news feed.
     */
    getUserFeedPaginated(userId: number, page: number, size: number) {
        return axios.get<Post[]>(`${API_URL}/feed/${userId}/paginated`, {
            params: { page, size },
        });
    }

    /**
     * Fetch posts in a specific group.
     */
    getPostsByGroup(groupId: number) {
        return axios.get<Post[]>(`${API_URL}/group/${groupId}`);
    }

    /**
     * Fetch paginated posts in a specific group.
     */
    getPostsByGroupPaginated(groupId: number, page: number, size: number) {
        return axios.get<Post[]>(`${API_URL}/group/${groupId}/paginated`, {
            params: { page, size },
        });
    }

    /**
     * Search posts by title or content.
     */
    searchPosts(searchTerm: string, page: number, size: number) {
        return axios.get<Post[]>(`${API_URL}/search`, {
            params: { searchTerm, page, size },
        });
    }

    /**
     * Fetch posts by category.
     */
    getPostsByCategory(categories: string[]) {
        return axios.get<Post[]>(`${API_URL}/category`, {
            params: { categories },
        });
    }

    /**
     * Fetch the most reacted (trending) posts.
     */
    getTopPosts() {
        return axios.get<Post[]>(`${API_URL}/top`);
    }

    /**
     * Create a new post inside a group.
     */
    createPost(authorId: number, groupId: number, title: string, content: string, categories: string[]) {
        return axios.post<Post>(`${API_URL}`, {
            authorId,
            groupId,
            title,
            content,
            categories,
        });
    }

    /**
     * Delete a post (only the author or an admin can delete).
     */
    deletePost(postId: number, userId: number) {
        return axios.delete(`${API_URL}/${postId}/user/${userId}`);
    }
}

export default new PostService();
