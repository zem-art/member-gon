export default function ProductCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-transparent dark:border-gray-800 animate-pulse">
            {/* Image placeholder */}
            <div className="aspect-square bg-gray-200 dark:bg-gray-800" />

            {/* Content */}
            <div className="p-4 md:p-6 space-y-3">
                {/* Title */}
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4" />
                {/* Price */}
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2" />
                {/* Button */}
                <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-xl w-full mt-2" />
            </div>
        </div>
    );
}
