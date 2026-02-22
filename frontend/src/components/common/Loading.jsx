const Loading = ({ fullScreen = false, size = 'md' }) => {
  const ring = (
    <div
      className="rounded-full border-[2.5px] animate-spin shrink-0"
      style={{
        borderColor: 'var(--border-color)',
        borderTopColor: '#6366f1',
        width: size === 'sm' ? 18 : size === 'lg' ? 40 : 26,
        height: size === 'sm' ? 18 : size === 'lg' ? 40 : 26,
      }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 animate-fade-in"
           style={{ background: 'var(--bg-base)' }}>
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-brand-gradient opacity-20 blur-2xl scale-150" />
          <div className="relative w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-3xl shadow-brand-lg">
            🍽️
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border-[2.5px] animate-spin"
               style={{ borderColor: 'var(--border-color)', borderTopColor: '#6366f1', width: 28, height: 28 }} />
        </div>
        <div className="text-center">
          <p className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            Campus Cravings
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Loading your experience...
          </p>
        </div>
        <div className="flex gap-1.5">
          {[0,0.2,0.4].map((d, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-16">
      {ring}
    </div>
  );
};

export const SkeletonLine = ({ className = '' }) => (
  <div className={`skeleton h-4 rounded-lg ${className}`} />
);

export const SkeletonCard = () => (
  <div className="card space-y-3">
    <div className="skeleton h-36 rounded-xl" />
    <SkeletonLine className="w-3/4" />
    <SkeletonLine className="w-1/2" />
    <div className="flex gap-2">
      <SkeletonLine className="w-16 h-6" />
      <SkeletonLine className="w-20 h-6" />
    </div>
  </div>
);

export default Loading;

  const sizes = { sm: 16, md: 24, lg: 40 };
