import { useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import Dashboard from "./Dashboard";

export default function Generate() {
  const [isGenerating, setIsGenerating] = useState(true);

  const handleGenerationComplete = () => {
    setIsGenerating(false);
  };

  if (isGenerating) {
    return <LoadingScreen onComplete={handleGenerationComplete} />;
  }

  // Redirect to dashboard after generation completes
  return <Dashboard />;
}