"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportMapAsPNG } from "../utils/storage";

interface ExportButtonProps {
  getSVGElement: () => SVGSVGElement | null;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  getSVGElement,
  className = "",
}) => {
  const handleExport = async () => {
    try {
      const svgElement = getSVGElement();
      if (!svgElement) {
        toast.error("Map not ready for export. Please try again.");
        return;
      }

      await exportMapAsPNG(svgElement);
      toast.success("Map exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export map. Please try again.");
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      className={`flex items-center gap-2 cursor-pointer ${className}`}
    >
      <Download className="w-4 h-4" />
      Export Map
    </Button>
  );
};
