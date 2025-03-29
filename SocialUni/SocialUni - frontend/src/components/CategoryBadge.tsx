import React from 'react';
import { Category } from '../api/interfaces';
import { 
  FaCode, FaGamepad, FaMusic, FaBook, FaFilm, 
  FaUserGraduate, FaLaptopCode, FaChalkboardTeacher,
  FaFlask, FaGlobeAmericas, FaHeartbeat, FaPalette,
  FaBullhorn, FaProjectDiagram, FaGlobe, FaFootballBall,
  FaTheaterMasks
} from 'react-icons/fa';

interface CategoryBadgeProps {
  category: Category;
  onClick?: (category: Category) => void;
  className?: string;
}

// Map of categories to their respective icons and colors
const categoryConfig: Record<Category, { icon: React.ReactNode; color: string }> = {
  [Category.DISCUSSION]: { icon: <FaGlobe />, color: 'bg-blue-500' },
  [Category.ANNOUNCEMENT]: { icon: <FaBullhorn />, color: 'bg-red-500' },
  [Category.PROJECT]: { icon: <FaProjectDiagram />, color: 'bg-green-600' },
  [Category.GENERAL]: { icon: <FaGlobe />, color: 'bg-gray-600' },
  [Category.TECH]: { icon: <FaLaptopCode />, color: 'bg-indigo-600' },
  [Category.ART]: { icon: <FaPalette />, color: 'bg-pink-500' },
  [Category.MUSIC]: { icon: <FaMusic />, color: 'bg-purple-500' },
  [Category.SPORTS]: { icon: <FaFootballBall />, color: 'bg-green-500' },
  [Category.GAMING]: { icon: <FaGamepad />, color: 'bg-blue-700' },
  [Category.ENTERTAINMENT]: { icon: <FaTheaterMasks />, color: 'bg-yellow-600' },
  [Category.SCIENCE]: { icon: <FaFlask />, color: 'bg-teal-500' }
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  onClick,
  className = ''
}) => {
  // Default to GENERAL if category is invalid
  const validCategory = Object.values(Category).includes(category) ? category : Category.GENERAL;
  const config = categoryConfig[validCategory];
  
  const handleClick = () => {
    if (onClick) {
      onClick(category);
    }
  };
  
  return (
    <div 
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${config.color} ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
      onClick={onClick ? handleClick : undefined}
    >
      {config.icon && <span className="mr-1">{config.icon}</span>}
      {category}
    </div>
  );
};

export default CategoryBadge; 