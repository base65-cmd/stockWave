const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-black/25 h-full flex justify-center items-center z-50">
      <div className="flex items-center justify-center space-x-2">
        <div
          className="w-4 h-4 rounded-full bg-blue-600 animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-4 h-4 rounded-full bg-blue-600 animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-4 h-4 rounded-full bg-blue-600 animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
