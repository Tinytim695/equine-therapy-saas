export type Severity = "normal" | "mild" | "severe";

export type MuscleZoneId =
  | "poll"
  | "neck"
  | "withers"
  | "shoulder"
  | "back"
  | "lumbar"
  | "glutes"
  | "stifle"
  | "hamstrings"
  | "lower_legs";

export interface MuscleZone {
  id: MuscleZoneId;
  label: string;
  description: string;
}

export interface ZoneState {
  zoneId: MuscleZoneId;
  severity: Severity;
  notes?: string;
}

export const MUSCLE_ZONES: MuscleZone[] = [
  { id: "poll", label: "Poll", description: "Atlas/axis junction, often tension from bit or head position" },
  { id: "neck", label: "Neck", description: "Cervical musculature, brachiocephalicus, splenius" },
  { id: "withers", label: "Withers", description: "Trapezius insertion, saddle pressure point" },
  { id: "shoulder", label: "Shoulder", description: "Scapula region, supraspinatus, infraspinatus" },
  { id: "back", label: "Back", description: "Longissimus dorsi, thoracic epaxial muscles" },
  { id: "lumbar", label: "Lumbar", description: "Lumbar epaxials, common compensatory zone" },
  { id: "glutes", label: "Glutes", description: "Gluteal group, power generation" },
  { id: "stifle", label: "Stifle", description: "Stifle joint complex, quadriceps insertion" },
  { id: "hamstrings", label: "Hamstrings", description: "Semitendinosus, semimembranosus, biceps femoris" },
  { id: "lower_legs", label: "Lower Legs", description: "Tendons, suspensory, digital flexors" },
];

export const SEVERITY_COLORS: Record<Severity, { fill: string; stroke: string; label: string; bg: string; text: string }> = {
  normal: {
    fill: "#86efac",
    stroke: "#16a34a",
    label: "Normal",
    bg: "bg-green-100",
    text: "text-green-800",
  },
  mild: {
    fill: "#fde047",
    stroke: "#ca8a04",
    label: "Mild",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  severe: {
    fill: "#fca5a5",
    stroke: "#dc2626",
    label: "Severe",
    bg: "bg-red-100",
    text: "text-red-800",
  },
};

export function cycleSeverity(current: Severity): Severity {
  if (current === "normal") return "mild";
  if (current === "mild") return "severe";
  return "normal";
}
