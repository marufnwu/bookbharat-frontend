export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Page Skeleton - matches typical page layout */}
      <div className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Header skeleton */}
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              <div className="h-6 bg-gray-100 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Content grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[16/9] bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}