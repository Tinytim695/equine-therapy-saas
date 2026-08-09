import { jsPDF } from "jspdf";
import type { ZoneState } from "@/types/muscle";
import type { RehabExercise } from "@/types/rehab";
import { MUSCLE_ZONES, SEVERITY_COLORS } from "@/types/muscle";

export interface SessionPdfInput {
  horseName?: string;
  clientName?: string;
  therapistName?: string;
  sessionDate: string;
  notes?: string | null;
  muscleMap: ZoneState[];
  rehabPlan: RehabExercise[];
  title?: string | null;
}

function formatDate(iso: string) {
  try {
    return new Date(
      iso.length === 10 ? iso + "T12:00:00" : iso
    ).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Generate a clean 1-page session summary PDF and trigger download.
 */
export function downloadSessionPdf(input: SessionPdfInput) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const line = (gap = 14) => {
    y += gap;
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFillColor(6, 95, 70);
  doc.rect(0, 0, pageWidth, 56, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Equine Therapy \u2014 Session Report", margin, 34);

  y = 76;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(input.title || "Therapy Session", margin, y);
  line(18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const meta = [
    `Date: ${formatDate(input.sessionDate)}`,
    input.horseName ? `Horse: ${input.horseName}` : null,
    input.clientName ? `Client: ${input.clientName}` : null,
    input.therapistName ? `Therapist: ${input.therapistName}` : null,
  ].filter(Boolean) as string[];

  meta.forEach((m) => {
    doc.text(m, margin, y);
    line(14);
  });

  line(6);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  line(20);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Muscle Tension Map", margin, y);
  line(16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const zones = input.muscleMap?.length
    ? input.muscleMap
    : MUSCLE_ZONES.map((z) => ({
        zoneId: z.id,
        severity: "normal" as const,
      }));

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 10, contentWidth, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Zone", margin + 8, y);
  doc.text("Status", margin + 160, y);
  doc.text("Guidance", margin + 240, y);
  line(16);

  doc.setFont("helvetica", "normal");
  const guidance: Record<string, string> = {
    normal: "No extra care needed",
    mild: "Gentle stretching recommended",
    severe: "Follow therapist guidance closely",
  };

  zones.forEach((z) => {
    const label =
      MUSCLE_ZONES.find((m) => m.id === z.zoneId)?.label || z.zoneId;
    const sev = z.severity || "normal";
    const sevLabel = SEVERITY_COLORS[sev]?.label || sev;

    const colors: Record<string, [number, number, number]> = {
      normal: [134, 239, 172],
      mild: [253, 224, 71],
      severe: [252, 165, 165],
    };
    const [r, g, b] = colors[sev] || colors.normal;
    doc.setFillColor(r, g, b);
    doc.circle(margin + 152, y - 3, 4, "F");

    doc.setTextColor(30, 41, 59);
    doc.text(label, margin + 8, y);
    doc.text(sevLabel, margin + 160, y);
    doc.setTextColor(100, 116, 139);
    doc.text(guidance[sev] || "", margin + 240, y);
    line(14);
  });

  line(10);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  line(20);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Rehab Plan", margin, y);
  line(16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  if (!input.rehabPlan?.length) {
    doc.setTextColor(100, 116, 139);
    doc.text("No exercises prescribed for this session.", margin, y);
    line(14);
  } else {
    input.rehabPlan.forEach((ex, i) => {
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${ex.name}`, margin, y);
      line(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(
        `${ex.sets} sets \u00b7 ${ex.reps} \u00b7 ${ex.frequency}`,
        margin + 12,
        y
      );
      line(12);
      if (ex.instructions) {
        const lines = doc.splitTextToSize(ex.instructions, contentWidth - 12);
        doc.setTextColor(100, 116, 139);
        doc.text(lines, margin + 12, y);
        line(12 * lines.length);
      }
      line(4);
    });
  }

  line(8);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  line(20);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Clinical Notes", margin, y);
  line(16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const notes = input.notes?.trim() || "No written notes recorded.";
  const noteLines = doc.splitTextToSize(notes, contentWidth);
  doc.text(noteLines, margin, y);
  y += 12 * noteLines.length;

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Generated by Equine Therapy SaaS \u00b7 Confidential clinical document",
    margin,
    760
  );

  const safeDate = input.sessionDate.replace(/[^0-9-]/g, "");
  const safeHorse = (input.horseName || "session")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 24);
  doc.save(`equine-session-${safeHorse}-${safeDate}.pdf`);
}
