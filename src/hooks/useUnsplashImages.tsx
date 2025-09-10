import { useState, useEffect } from 'react';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

interface UseUnsplashImagesResult {
  images: string[];
  loading: boolean;
  error: string | null;
}

// Função para extrair palavras-chave do título
function extractKeywords(title: string): string {
  // Remove palavras comuns e mantém apenas palavras relevantes
  const commonWords = ['de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'com', 'para', 'por', 'e', 'ou', 'mas', 'que', 'se', 'a', 'o', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'the', 'and', 'or', 'but', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by'];
  
  const words = title.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 3); // Pega apenas as primeiras 3 palavras relevantes
  
  return words.join(' ') || 'business technology marketing';
}

export function useUnsplashImages(query: string, count: number = 5): UseUnsplashImagesResult {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query?.trim()) return;

    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Extrair palavras-chave relevantes do query
        const keywords = extractKeywords(query);
        
        // Usar Unsplash API (gratuita, sem chave necessária para desenvolvimento)
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&per_page=${count}&orientation=landscape&client_id=UyEJIoBekNysWe26-p8GQY6zhNRGJnTVXIB-rGVKweo`,
          {
            headers: {
              'Accept-Version': 'v1'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const imageUrls = data.results.map((img: UnsplashImage) => img.urls.regular);
          setImages(imageUrls);
        } else {
          // Fallback: usar imagens genéricas se não encontrar nada específico
          const fallbackResponse = await fetch(
            `https://api.unsplash.com/search/photos?query=business technology&per_page=${count}&orientation=landscape&client_id=UyEJIoBekNysWe26-p8GQY6zhNRGJnTVXIB-rGVKweo`,
            {
              headers: {
                'Accept-Version': 'v1'
              }
            }
          );
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const imageUrls = fallbackData.results.map((img: UnsplashImage) => img.urls.regular);
            setImages(imageUrls);
          } else {
            throw new Error('Não foi possível carregar imagens');
          }
        }
      } catch (err) {
        console.error('Erro ao buscar imagens do Unsplash:', err);
        setError('Não foi possível carregar as imagens');
        
        // Fallback para imagens padrão locais se a API falhar
        const placeholderImages = Array(count).fill(0).map((_, index) => 
          `https://images.unsplash.com/photo-${1500000000000 + index}?auto=format&fit=crop&w=800&h=600&q=80`
        );
        setImages(placeholderImages);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [query, count]);

  return { images, loading, error };
}