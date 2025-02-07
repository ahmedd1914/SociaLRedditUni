const RightSidebar = () => {
    return (
        <aside className="w-64 bg-gray-900 p-4 text-white">
            <h2 className="text-lg font-bold mb-3">Popular Communities</h2>
            <ul className="space-y-2">
                <li className="flex justify-between"><span>/r/explainlikeimfive</span> <button className="text-blue-500">Join</button></li>
                <li className="flex justify-between"><span>/r/AskReddit</span> <button className="text-blue-500">Join</button></li>
                <li className="flex justify-between"><span>/r/Movies</span> <button className="text-blue-500">Join</button></li>
                <li className="flex justify-between"><span>/r/Gaming</span> <button className="text-blue-500">Join</button></li>
            </ul>
        </aside>
    );
};

export default RightSidebar;
