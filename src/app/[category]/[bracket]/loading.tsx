import { Skeleton } from "@/components/ui/skeleton";

export default function BracketLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-8">
        {/* Title */}
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-56" />
        </div>

        {/* Size selector placeholder */}
        <div className="flex w-full justify-center gap-3">
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>

        {/* Start button placeholder */}
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>
    </div>
  );
}
