export default function ArcadeSkeleton() {
  return (
    <div className="w-full h-48 border-4 border-black dark:border-white bg-gray-200 dark:bg-gray-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] animate-pulse flex flex-col justify-end p-4">
      <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-700 mb-2" />
      <div className="w-1/2 h-3 bg-gray-300 dark:bg-gray-700" />
    </div>
  )
}
