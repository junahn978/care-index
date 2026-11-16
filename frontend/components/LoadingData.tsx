import { cn } from "cn";
import { Spinner } from "@/components/ui/spinner";

// the full-page loader, shared by the home page and MeGate so both look the same
export default function LoadingData() {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-4 text-[#008378]"
    >
      <Spinner className="size-[2.5em]" aria-hidden="true" />
      <p className="flex items-baseline text-fluid-lg font-medium">
        Loading Data
        {/* three dots bouncing one after another; still for users who prefer reduced motion */}
        <span aria-hidden="true" className="flex">
          {["", "[animation-delay:150ms]", "[animation-delay:300ms]"].map(
            (delay, i) => (
              <span
                key={i}
                className={cn(
                  "animate-bounce motion-reduce:animate-none",
                  delay,
                )}
              >
                .
              </span>
            ),
          )}
        </span>
      </p>
    </div>
  );
}
