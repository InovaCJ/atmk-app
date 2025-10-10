import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Upload, Link, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClientInputs } from '@/hooks/useClientInputs';
import { toast } from 'sonner';

const createInputSchema = z.object({
  title: z.string().optional(),
  content_text: z.string().optional(),
  url: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
}).refine((data) => {
  // At least one content field must be provided
  return data.content_text || data.url;
}, {
  message: "Pelo menos um campo de conteúdo deve ser preenchido",
  path: ["content_text"],
});

type CreateInputFormData = z.infer<typeof createInputSchema>;

interface CreateInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  type?: 'text' | 'file' | 'url' | 'structured' | null;
}

export function CreateInputModal({ isOpen, onClose, clientId, type }: CreateInputModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { createInput } = useClientInputs(clientId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateInputFormData>({
    resolver: zodResolver(createInputSchema),
  });

  const watchedContent = watch('content_text');
  const watchedUrl = watch('url');

  const getInputType = (): 'text' | 'file' | 'url' | 'structured' => {
    if (type) return type;
    if (file) return 'file';
    if (watchedUrl) return 'url';
    if (watchedContent) return 'text';
    return 'text';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValue('title', selectedFile.name);
    }
  };

  const onSubmit = async (data: CreateInputFormData) => {
    try {
      setIsSubmitting(true);
      
      const inputData = {
        type: getInputType(),
        title: data.title,
        content_text: data.content_text,
        url: data.url,
        file_ref: file ? `clients/${clientId}/files/${file.name}` : undefined,
        metadata: {
          ...data.metadata,
          original_filename: file?.name,
          file_size: file?.size,
        },
      };

      await createInput(inputData);
      toast.success('Input criado com sucesso');
      reset();
      setFile(null);
      onClose();
    } catch (error) {
      console.error('Error creating input:', error);
      toast.error('Erro ao criar input');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setFile(null);
    onClose();
  };

  const getModalTitle = () => {
    switch (type) {
      case 'text':
        return 'Adicionar Texto';
      case 'file':
        return 'Upload de Arquivo';
      case 'url':
        return 'Adicionar URL';
      default:
        return 'Novo Input';
    }
  };

  const getModalDescription = () => {
    switch (type) {
      case 'text':
        return 'Adicione um texto para sua base de conhecimento';
      case 'file':
        return 'Faça upload de um arquivo para processar';
      case 'url':
        return 'Adicione uma URL para extrair conteúdo';
      default:
        return 'Adicione conteúdo para sua base de conhecimento';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'text':
        return <FileText className="h-5 w-5" />;
      case 'file':
        return <Upload className="h-5 w-5" />;
      case 'url':
        return <Link className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            {getModalDescription()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Título do input (opcional)"
            />
          </div>

          {(!type || type === 'text') && (
            <div className="space-y-2">
              <Label htmlFor="content_text">Conteúdo *</Label>
              <Textarea
                id="content_text"
                {...register('content_text')}
                placeholder="Digite o conteúdo aqui..."
                rows={8}
                className={errors.content_text ? 'border-destructive' : ''}
              />
              {errors.content_text && (
                <p className="text-sm text-destructive">{errors.content_text.message}</p>
              )}
            </div>
          )}

          {(!type || type === 'file') && (
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Arquivo selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}

          {(!type || type === 'url') && (
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                {...register('url')}
                placeholder="https://exemplo.com"
                type="url"
                className={errors.url ? 'border-destructive' : ''}
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="metadata">Metadados (JSON)</Label>
            <Textarea
              id="metadata"
              {...register('metadata')}
              placeholder='{"tags": ["importante"], "category": "documento"}'
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Metadados adicionais em formato JSON (opcional)
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Input'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
