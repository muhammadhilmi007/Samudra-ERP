'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Select from '../atoms/Select';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

/**
 * Pagination - Component for handling pagination
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page, last page, and pages around current page
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're at the start or end
      if (currentPage <= 2) {
        endPage = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Add last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
      <div className="flex items-center mb-4 sm:mb-0">
        <p className="text-sm text-gray-700">
          Menampilkan{' '}
          <span className="font-medium">
            {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
          </span>{' '}
          sampai{' '}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{' '}
          dari{' '}
          <span className="font-medium">{totalItems}</span>{' '}
          hasil
        </p>
        
        <div className="ml-4">
          <label htmlFor="itemsPerPage" className="sr-only">
            Items per page
          </label>
          <Select
            id="itemsPerPage"
            value={itemsPerPage.toString()}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            options={[
              { value: '10', label: '10 per halaman' },
              { value: '25', label: '25 per halaman' },
              { value: '50', label: '50 per halaman' },
              { value: '100', label: '100 per halaman' },
            ]}
            className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
            currentPage === 1
              ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="sr-only">Previous</span>
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div className="hidden md:flex">
          {pageNumbers.map((page, index) => {
            if (page < 0) {
              // Render ellipsis
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              );
            }
            
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                  currentPage === page
                    ? 'z-10 bg-primary border-primary text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } border rounded-md`}
              >
                {page}
              </button>
            );
          })}
        </div>
        
        <div className="flex md:hidden">
          <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
            {currentPage} / {totalPages}
          </span>
        </div>
        
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
            currentPage === totalPages || totalPages === 0
              ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="sr-only">Next</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
