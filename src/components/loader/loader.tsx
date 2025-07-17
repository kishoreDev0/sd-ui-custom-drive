const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-white bg-opacity-70">
      <div className="relative">
        <div className="h-14 w-14 rounded-full border-3 border-gray-200"></div>
        <div className="absolute top-0 left-0 h-14 w-14 rounded-full border-3 border-transparent border-t-[var(--button)] animate-spin"></div>
      </div>
      {text && <p className="mt-1 text-[var(--gray-50)] font-medium">{text}</p>}
    </div>
  );
};

export default Loader;
