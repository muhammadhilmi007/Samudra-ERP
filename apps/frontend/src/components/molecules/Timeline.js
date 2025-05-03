'use client';

import { 
  CheckCircleIcon, 
  XCircleIcon, 
  PlusCircleIcon, 
  PencilIcon, 
  TrashIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

export function Timeline({ items = [] }) {
  // Function to render the appropriate icon based on the icon type
  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'check':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'x':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'plus':
        return <PlusCircleIcon className="h-6 w-6 text-blue-500" />;
      case 'edit':
        return <PencilIcon className="h-6 w-6 text-amber-500" />;
      case 'trash':
        return <TrashIcon className="h-6 w-6 text-red-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-gray-500">No timeline items to display</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {items.map((item, index) => (
          <li key={index}>
            <div className="relative pb-8">
              {index !== items.length - 1 ? (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200">
                    {renderIcon(item.icon)}
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-1.5">
                  <div className="text-sm text-gray-500">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <p>{item.description}</p>
                    <div className="mt-1 text-xs text-gray-400">{item.timestamp}</div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
