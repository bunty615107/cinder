import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

type SliderProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
  className?: string;
  "aria-label"?: string;
};

export function Slider({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  className,
  "aria-label": ariaLabel,
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(next) => onValueChange(next[0] ?? min)}
      aria-label={ariaLabel}
      className={cn(
        "relative flex h-11 w-full touch-none items-center select-none",
        className,
      )}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-fg/15">
        <SliderPrimitive.Range className="absolute h-full bg-accent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="relative block size-4 rounded-full bg-accent shadow-[0_0_0_1px_rgba(255,255,255,0.12)] outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']" />
    </SliderPrimitive.Root>
  );
}
