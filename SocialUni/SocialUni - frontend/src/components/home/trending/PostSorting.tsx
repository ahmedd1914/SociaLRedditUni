import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineTrendingUp, HiOutlineFire, HiOutlineClock, HiOutlineSearch } from 'react-icons/hi';
import { BsArrowUp, BsArrowDown } from 'react-icons/bs';
import { MdOutlineWhatshot } from 'react-icons/md';
import { FaRegFolder } from 'react-icons/fa';

// Sort options
export const SORT_OPTIONS = [
  { label: 'Hot', value: 'hot', icon: <MdOutlineWhatshot className="text-orange-500" /> },
  { label: 'Best', value: 'best', icon: <HiOutlineTrendingUp className="text-blue-500" /> },
  { label: 'New', value: 'new', icon: <HiOutlineClock className="text-green-500" /> },
  { label: 'Top', value: 'top', icon: <HiOutlineFire className="text-red-500" /> },
  { label: 'Rising', value: 'rising', icon: <BsArrowUp className="text-purple-500" /> },
];

// Time filter options
export const TIME_FILTERS = [
  { label: 'Today', value: 'day' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
];


interface PostSortingProps {
  onSortChange?: (sort: string) => void;
  onTimeFilterChange?: (timeFilter: string) => void;
  onCategoryChange?: (category: string) => void;
  onSearchChange?: (searchTerm: string) => void;
}

const PostSorting: React.FC<PostSortingProps> = ({ 
  onSortChange,
  onTimeFilterChange,
  onCategoryChange,
  onSearchChange
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSort, setActiveSort] = useState(searchParams.get('sort') || 'hot');
  const [timeFilter, setTimeFilter] = useState(searchParams.get('time') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Update URL when sort or time filter changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', activeSort);
    newParams.set('time', timeFilter);
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  }, [activeSort, timeFilter, category, searchTerm, setSearchParams, searchParams]);

  // Handle sort change
  const handleSortChange = (value: string) => {
    setActiveSort(value);
    setShowSortDropdown(false);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  // Handle time filter change
  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    setShowTimeDropdown(false);
    if (onTimeFilterChange) {
      onTimeFilterChange(value);
    }
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setShowCategoryDropdown(false);
    if (onCategoryChange) {
      onCategoryChange(value);
    }
  };

  // Handle search term change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchInput(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="dropdown dropdown-bottom">
        <label 
          tabIndex={0} 
          className="btn btn-sm btn-outline"
          onClick={() => setShowSortDropdown(!showSortDropdown)}
        >
          {SORT_OPTIONS.find(opt => opt.value === activeSort)?.icon}
          <span className="ml-1">{SORT_OPTIONS.find(opt => opt.value === activeSort)?.label}</span>
          <BsArrowDown className="ml-1" />
        </label>
        {showSortDropdown && (
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            {SORT_OPTIONS.map(option => (
              <li key={option.value}>
                <a 
                  onClick={() => handleSortChange(option.value)}
                  className={activeSort === option.value ? 'active' : ''}
                >
                  {option.icon}
                  {option.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {activeSort === 'top' && (
        <div className="dropdown dropdown-bottom">
          <label 
            tabIndex={0} 
            className="btn btn-sm btn-outline"
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
          >
            {TIME_FILTERS.find(opt => opt.value === timeFilter)?.label}
            <BsArrowDown className="ml-1" />
          </label>
          {showTimeDropdown && (
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              {TIME_FILTERS.map(option => (
                <li key={option.value}>
                  <a 
                    onClick={() => handleTimeFilterChange(option.value)}
                    className={timeFilter === option.value ? 'active' : ''}
                  >
                    {option.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default PostSorting; 