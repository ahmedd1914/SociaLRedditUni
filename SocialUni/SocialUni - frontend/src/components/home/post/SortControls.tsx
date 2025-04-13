import React from 'react';
import { HiOutlineSearch } from 'react-icons/hi';
import { 
  FaSortAmountDown, 
  FaFire, 
  FaClock, 
  FaStar, 
  FaHistory 
} from 'react-icons/fa';

type SortOption = 'top' | 'new' | 'best' | 'old';

interface SortControlsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SortControls: React.FC<SortControlsProps> = ({
  sortBy,
  onSortChange,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-6 mb-6 bg-base-200 p-4 rounded-xl">
      <div className="flex-1">
        <div className="relative">
          <FaSortAmountDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
          <select
            className="select select-bordered w-full pl-10 pr-8 bg-base-100 hover:border-primary transition-colors duration-200"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <option value="top" className="flex items-center gap-2">
              Top Comments
            </option>
            <option value="new">Latest Comments</option>
            <option value="best">Best Rated</option>
            <option value="old">Oldest First</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-base-content/60">
            {sortBy === 'top' && <FaFire className="text-orange-500" />}
            {sortBy === 'new' && <FaClock className="text-green-500" />}
            {sortBy === 'best' && <FaStar className="text-yellow-500" />}
            {sortBy === 'old' && <FaHistory className="text-blue-500" />}
          </div>
        </div>
      </div>
      <div className="relative flex-1">
        <div className="relative">
          <HiOutlineSearch 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary"
            size={20}
          />
          <input
            type="text"
            placeholder="Search in comments..."
            className="input input-bordered w-full pl-10 bg-base-100 hover:border-primary transition-colors duration-200 focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-primary transition-colors duration-200"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortControls; 