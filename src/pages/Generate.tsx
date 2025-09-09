import { useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Generate() {
  const [isGenerating, setIsGenerating] = useState(false); // Mudei para false por padrão para demonstrar o estado
  const navigate = useNavigate();

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    // Redirect to library page
    window.location.href = '/library';
  };

  if (isGenerating) {
    return <LoadingScreen onComplete={handleGenerationComplete} />;
  }

  // Estado quando não há conteúdo sendo gerado
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileSearch className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-xl">Nenhum conteúdo sendo gerado</CardTitle>
          <CardDescription>
            Não há geração de conteúdo ativa no momento. Retorne ao dashboard para iniciar uma nova geração.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate('/')}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}