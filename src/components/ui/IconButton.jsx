// components/ui/IconButton.jsx
export const IconButton = ({ icon: Icon, onClick, className = "", ariaLabel }) => (
  <button 
    onClick={onClick} 
    aria-label={ariaLabel}
    className={`p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 active:scale-95 ${className}`}
  >
    <Icon className="w-6 h-6 text-gray-700" />
  </button>
);