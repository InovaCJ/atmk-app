import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Mail, Send, AlertCircle } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClientInvites } from '@/hooks/useClientInvites';
import { toast } from 'sonner';

const createInviteSchema = z.object({
  email: z.string().email('E-mail inválido'),
  role: z.enum(['client_admin', 'editor', 'viewer']),
});

type CreateInviteFormData = z.infer<typeof createInviteSchema>;

interface CreateInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

export function CreateInviteModal({ isOpen, onClose, clientId }: CreateInviteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendInvite } = useClientInvites(clientId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateInviteFormData>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: {
      role: 'viewer',
    },
  });

  const onSubmit = async (data: CreateInviteFormData) => {
    try {
      setIsSubmitting(true);
      await sendInvite(data);
      toast.success('Convite enviado com sucesso!');
      reset();
      onClose();
    } catch (error) {
      console.error('Error sending invite:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar convite';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Convidar Membro
          </DialogTitle>
          <DialogDescription>
            Envie um convite por email para colaborar nesta empresa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="usuario@exemplo.com"
                className="pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select onValueChange={(value) => setValue('role', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div className="flex items-center gap-2">
                    <span>👁️</span>
                    <div>
                      <div className="font-medium">Visualizador</div>
                      <div className="text-xs text-muted-foreground">
                        Pode visualizar conteúdos
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div className="flex items-center gap-2">
                    <span>✏️</span>
                    <div>
                      <div className="font-medium">Editor</div>
                      <div className="text-xs text-muted-foreground">
                        Pode editar inputs e base de conhecimento
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="client_admin">
                  <div className="flex items-center gap-2">
                    <span>👑</span>
                    <div>
                      <div className="font-medium">Administrador</div>
                      <div className="text-xs text-muted-foreground">
                        Pode gerenciar tudo do cliente
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Como funciona:</strong> O convite será enviado por email com um link direto. 
              Se a pessoa não tiver conta no ATMK, uma será criada automaticamente. 
              O convite expira em 7 dias.
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Permissões por função:</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div><strong>Visualizador:</strong> Ver conteúdos e resultados</div>
              <div><strong>Editor:</strong> + Adicionar/editar inputs e base de conhecimento</div>
              <div><strong>Administrador:</strong> + Gerenciar membros e configurações</div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
