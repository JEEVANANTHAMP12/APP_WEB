const Loading = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 16, md: 24, lg: 40 };
  const px = sizes[size] || 24;

  const spinner = (
    <div
      style={{ width: px, height: px }}
      className="border-[3px] border-gray-200 border-t-primary-500 rounded-full animate-spin"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="text-3xl">🍽️</div>
          <div
            style={{ width: 40, height: 40 }}
            className="border-[4px] border-gray-200 border-t-primary-500 rounded-full animate-spin"
          />
          <p className="text-gray-500 text-sm">Loading Campus Cravings...</p>
        </div>
      </div>
    );
  }

  return <div className="flex justify-center py-8">{spinner}</div>;
};

export default Loading;
