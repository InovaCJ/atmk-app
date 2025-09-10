import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Copy, Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUnsplashImages } from "@/hooks/useUnsplashImages";

interface ImageCarouselProps {
  images: string[];
  captions?: string[];
  title: string;
}

export function ImageCarousel({ images, captions = [], title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Verificar se as imagens são placeholders ou estão vazias
  const hasPlaceholderImages = images.length === 0 || images.every(img => 
    img.includes('/placeholder.svg') || img.includes('placeholder') || img === ''
  );
  
  // Buscar imagens do Unsplash se necessário
  const { images: unsplashImages, loading, error } = useUnsplashImages(
    hasPlaceholderImages ? title : '', 
    hasPlaceholderImages ? Math.max(images.length, 5) : 0
  );
  
  // Usar imagens do Unsplash se as originais são placeholders
  const finalImages = hasPlaceholderImages && unsplashImages.length > 0 ? unsplashImages : images;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % finalImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + finalImages.length) % finalImages.length);
  };

  // Se está carregando imagens do Unsplash
  if (hasPlaceholderImages && loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground">Carregando imagens relacionadas...</p>
          </div>
        </div>
      </div>
    );
  }

  // Se não há imagens para mostrar
  if (finalImages.length === 0) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-center py-16 border-2 border-dashed rounded-lg">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhuma imagem disponível</p>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência`,
    });
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `post-imagem-${index + 1}-${title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Download iniciado",
        description: "A imagem está sendo baixada para sua pasta de downloads."
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar a imagem. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header com info sobre imagens do Unsplash */}
      {hasPlaceholderImages && unsplashImages.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
          <RefreshCw className="h-3 w-3" />
          Imagens sugeridas baseadas no tema: "{title}"
        </div>
      )}
      
      {/* Navigation Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {finalImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} de {finalImages.length}
        </span>
      </div>

      {/* Main Carousel Frame */}
      <div className="relative w-full max-w-lg mx-auto">
        <div className="overflow-hidden rounded-lg w-full bg-muted/10">
          <div 
            className="flex transition-transform duration-300 ease-in-out w-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {finalImages.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0 space-y-3 p-2">
                {/* Caption */}
                <div className="flex items-start gap-2">
                  <Textarea
                    value={captions[index] || `Legenda do slide ${index + 1}`}
                    readOnly
                    className="text-sm flex-1 min-h-[60px]"
                    rows={2}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(captions[index] || "", "Legenda")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Image */}
                <div className="flex justify-center bg-background rounded-lg p-4">
                  <img 
                    src={image} 
                    alt={`Slide ${index + 1}`} 
                    className="w-full max-w-sm h-64 sm:h-80 object-cover rounded-lg shadow-md border" 
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', image);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Download Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => downloadImage(image, index)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Imagem {index + 1}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {finalImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-background/90 backdrop-blur-sm z-20 shadow-md"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-background/90 backdrop-blur-sm z-20 shadow-md"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-2 justify-center overflow-x-auto pb-2 px-2 max-w-lg mx-auto">
        {finalImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded border-2 transition-all duration-200 hover:scale-105 ${
              index === currentIndex ? 'border-primary ring-2 ring-primary/20' : 'border-muted hover:border-primary/50'
            }`}
          >
            <img
              src={image}
              alt={`Miniatura ${index + 1}`}
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0.3';
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}