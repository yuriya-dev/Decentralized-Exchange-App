interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-fintech-cardHover/50 rounded-lg ${className}`} 
    />
  );
};

export default Skeleton;