import React from 'react';

// Product Grid Shimmer Loader
export const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Image Placeholder */}
      <div className="aspect-[3/4] w-full rounded-2xl shimmer"></div>
      
      {/* Category Placeholder */}
      <div className="h-3 w-1/3 rounded-md shimmer"></div>
      
      {/* Title Placeholder */}
      <div className="h-5 w-3/4 rounded-md shimmer"></div>
      
      {/* Price & Cart Button Placeholder */}
      <div className="flex items-center justify-between mt-1">
        <div className="h-5 w-1/4 rounded-md shimmer"></div>
        <div className="h-8 w-1/3 rounded-lg shimmer"></div>
      </div>
    </div>
  );
};

// Product Details Page Shimmer Loader
export const ProductDetailsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Left Gallery Placeholder */}
      <div className="flex gap-4">
        {/* Thumbnails */}
        <div className="hidden sm:flex flex-col gap-3 w-16">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-16 h-20 rounded-lg shimmer"></div>
          ))}
        </div>
        {/* Main Image */}
        <div className="flex-1 aspect-[3/4] rounded-2xl shimmer"></div>
      </div>

      {/* Right Details Placeholder */}
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          {/* Title */}
          <div className="h-8 w-3/4 rounded-lg shimmer"></div>
          {/* Price */}
          <div className="h-6 w-1/4 rounded-md shimmer"></div>
        </div>

        <hr className="border-primary/5" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-md shimmer"></div>
          <div className="h-4 w-full rounded-md shimmer"></div>
          <div className="h-4 w-2/3 rounded-md shimmer"></div>
        </div>

        {/* Sizes */}
        <div className="space-y-2">
          <div className="h-3.5 w-16 rounded-md shimmer"></div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-lg shimmer"></div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <div className="h-3.5 w-16 rounded-md shimmer"></div>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full shimmer"></div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1 h-12 rounded-xl shimmer"></div>
          <div className="flex-1 h-12 rounded-xl shimmer"></div>
        </div>
      </div>
    </div>
  );
};

// Order Loading Skeleton
export const OrderSkeleton = () => {
  return (
    <div className="border border-primary/5 rounded-2xl p-6 bg-white space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4.5 w-36 rounded-md shimmer"></div>
          <div className="h-3 w-24 rounded-md shimmer"></div>
        </div>
        <div className="h-6 w-20 rounded-full shimmer"></div>
      </div>
      
      <hr className="border-primary/5" />

      {/* Items list */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="w-12 h-16 rounded-lg shimmer"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded-md shimmer"></div>
              <div className="h-3 w-1/4 rounded-md shimmer"></div>
            </div>
            <div className="h-4 w-12 rounded-md shimmer"></div>
          </div>
        ))}
      </div>

      <hr className="border-primary/5" />

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="h-5 w-24 rounded-md shimmer"></div>
        <div className="h-9 w-28 rounded-lg shimmer"></div>
      </div>
    </div>
  );
};
