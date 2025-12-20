import { Slider } from '@/components/ui/slider';

interface StatSliderProps {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function StatSlider({ label, min, max, value, onChange }: StatSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground capitalize">{label}</span>
        <span className="text-xs font-mono text-foreground">
          {value[0]} — {value[1]}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={5}
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
        className="w-full"
      />
    </div>
  );
}
