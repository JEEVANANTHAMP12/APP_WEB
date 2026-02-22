const Loading = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 16, md: 24, lg: 40 };
  const px = sizes[size] || 24;

  const spinner = (
    <div className="flex flex-col items-center">
      <div
        style={{ width: px, height: px }}
        className="border-[3px] border-gray-200 dark:border-gray-700 border-t-orange-500 dark:border-t-orange-400 rounded-full animate-spin"
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 z-50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
              🍽️
            </div>
          </div>
          <div
            style={{ width: 40, height: 40 }}
            className="border-[3px] border-gray-200 dark:border-gray-700 border-t-orange-500 dark:border-t-orange-400 rounded-full animate-spin"
          />
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 font-semibold">Loading Campus Cravings</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Preparing your delicious experience...</p>
          </div>
          {/* Loading dots animation */}
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  return <div className="flex justify-center py-12">{spinner}</div>;
};

export default Loading;
