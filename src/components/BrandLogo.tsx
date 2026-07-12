interface Props {
  size?: "sm" | "md" | "lg";
}

export default function BrandLogo({ size = "md" }: Props) {
  const sizes = {
    sm: "text-base px-1.5 py-0.5",
    md: "text-xl px-2.5 py-1",
    lg: "text-4xl px-4 py-2",
  };

  return (
    <span className="inline-flex items-center gap-0 font-black tracking-tighter leading-none select-none">
      <span
        className={`${sizes[size]} bg-yellow-400 dark:bg-yellow-300 text-black dark:text-black border-2 border-black dark:border-black -rotate-2 shadow-brutal-sm dark:shadow-brutal-sm`}
      >
        P
      </span>
      <span
        className={`${sizes[size]} bg-white dark:bg-gray-900 text-black dark:text-white border-2 border-black dark:border-white -rotate-2 shadow-brutal-sm dark:shadow-brutal-sm`}
      >
        ARTY
      </span>
      <span
        className={`${sizes[size]} bg-pink-400 dark:bg-pink-500 text-black dark:text-black border-2 border-black dark:border-black rotate-2 shadow-brutal-sm dark:shadow-brutal-sm`}
      >
        H
      </span>
      <span
        className={`${sizes[size]} bg-white dark:bg-gray-900 text-black dark:text-white border-2 border-black dark:border-white rotate-2 shadow-brutal-sm dark:shadow-brutal-sm`}
      >
        UB
      </span>
    </span>
  );
}
