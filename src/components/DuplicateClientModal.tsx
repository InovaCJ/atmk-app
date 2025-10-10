import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Copy, Building2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Client } from '@/types/clients';
import { toast } from 'sonner';

const duplicateClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string()
    .min(1, 'Slug é obrigatório')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  copySettings: z.boolean().default(true),
  copyNewsSources: z.boolean().default(true),
  copyAgents: z.boolean().default(true),
  copyKnowledgeBase: z.boolean().default(false),
});

type DuplicateClientFormData = z.infer<typeof duplicateClientSchema>;

interface DuplicateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onDuplicate: (clientId: string, newName: string, newSlug: string) => Promise<Client>;
}

export function DuplicateClientModal({ 
  isOpen, 
  onClose, 
  client, 
  onDuplicate 
}: DuplicateClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<DuplicateClientFormData>({
    resolver: zodResolver(duplicateClientSchema),
    defaultValues: {
      copySettings: true,
      copyNewsSources: true,
      copyAgents: true,
      copyKnowledgeBase: false,
    },
  });

  const watchedName = watch('name');

  // Auto-generate slug from name
  React.useEffect(() => {
    if (watchedName) {
      const slug = watchedName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      
      setValue('slug', slug);
    }
  }, [watchedName, setValue]);

  // Set default name when client changes
  React.useEffect(() => {
    if (client) {
      setValue('name', `${client.name} (Cópia)`);
    }
  }, [client, setValue]);

  const onSubmit = async (data: DuplicateClientFormData) => {
    if (!client) return;

    try {
      setIsSubmitting(true);
      await onDuplicate(client.id, data.name, data.slug);
      toast.success('Cliente duplicado com sucesso');
      reset();
      onClose();
    } catch (error) {
      console.error('Error duplicating client:', error);
      toast.error('Erro ao duplicar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicar Cliente
          </DialogTitle>
          <DialogDescription>
            Duplicar "{client.name}" com suas configurações
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nome da empresa"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="nome-da-empresa"
                className={errors.slug ? 'border-destructive' : ''}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">O que duplicar?</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copySettings"
                  checked={watch('copySettings')}
                  onCheckedChange={(checked) => setValue('copySettings', !!checked)}
                />
                <Label htmlFor="copySettings" className="text-sm">
                  Configurações (tom de voz, diretrizes, etc.)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copyNewsSources"
                  checked={watch('copyNewsSources')}
                  onCheckedChange={(checked) => setValue('copyNewsSources', !!checked)}
                />
                <Label htmlFor="copyNewsSources" className="text-sm">
                  Fontes de Notícias
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copyAgents"
                  checked={watch('copyAgents')}
                  onCheckedChange={(checked) => setValue('copyAgents', !!checked)}
                />
                <Label htmlFor="copyAgents" className="text-sm">
                  Perfis de Agentes
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copyKnowledgeBase"
                  checked={watch('copyKnowledgeBase')}
                  onCheckedChange={(checked) => setValue('copyKnowledgeBase', !!checked)}
                />
                <Label htmlFor="copyKnowledgeBase" className="text-sm">
                  Base de Conhecimento (atenção: pode ser custoso)
                </Label>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Cliente original:</p>
                <p className="text-muted-foreground">{client.name} (@{client.slug})</p>
                <p className="text-muted-foreground">Plano: {client.plan.toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Duplicando...' : 'Duplicar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
