import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Copy, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageCarouselProps {
  images: string[];
  captions?: string[];
  title: string;
}

export function ImageCarousel({ images, captions = [], title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, images.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

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
    <div className="space-y-4">
      {/* Navigation Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {images.map((_, index) => (
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
          {currentIndex + 1} de {images.length}
        </span>
      </div>

      {/* Main Carousel */}
      <div className="relative overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div 
            className="flex gap-4 transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * 320}px)`,
              width: `${images.length * 336}px` // 320px + 16px gap
            }}
          >
            {images.map((image, index) => (
              <div key={index} className="w-80 flex-shrink-0 space-y-3">
                {/* Caption */}
                <div className="flex items-start gap-2">
                  <Textarea
                    value={captions[index] || `Legenda do slide ${index + 1}`}
                    readOnly
                    className="text-sm flex-1"
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
                <img 
                  src={image} 
                  alt={`Slide ${index + 1}`} 
                  className="w-full aspect-square object-cover rounded-lg" 
                />
                
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
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-colors ${
              index === currentIndex ? 'border-primary' : 'border-muted'
            }`}
          >
            <img
              src={image}
              alt={`Miniatura ${index + 1}`}
              className="w-full h-full object-cover rounded"
            />
          </button>
        ))}
      </div>
    </div>
  );
}