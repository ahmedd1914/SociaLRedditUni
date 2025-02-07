import NewsFeed from "../components/NewsFeed";

const NewsFeedPage = () => {
    const userId = 1; // Replace with logged-in user ID

    return (
        <div>
            <h1>News Feed</h1>
    <NewsFeed userId={userId} />
    </div>
);
};

export default NewsFeedPage;
