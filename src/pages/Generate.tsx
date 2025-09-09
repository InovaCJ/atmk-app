import { useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import Dashboard from "./Dashboard";

export default function Generate() {
  const [isGenerating, setIsGenerating] = useState(true);

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    // Redirect to library page
    window.location.href = '/library';
  };

  if (isGenerating) {
    return <LoadingScreen onComplete={handleGenerationComplete} />;
  }

  // This should not be reached as we redirect in handleGenerationComplete
  return <Dashboard />;
}