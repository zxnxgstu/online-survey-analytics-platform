import {Link} from "react-router-dom";
import React from "react";

// Сторінка "Не знайдено"
const NotFound = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-300">404</h1>
                <h2 className="text-2xl font-semibold mb-4">Сторінку не знайдено</h2>
                <p className="text-gray-600 mb-6">На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.</p>
                <Link to="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Повернутись на головну
                </Link>
            </div>
        </div>
    );
};

export default NotFound;