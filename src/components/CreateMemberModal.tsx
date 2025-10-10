import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Mail } from 'lucide-react';
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
import { useClientInvites } from '@/hooks/useClientInvites';
import { toast } from 'sonner';

const createMemberSchema = z.object({
  email: z.string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido')
    .refine((email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }, 'Formato de e-mail inválido'),
  role: z.enum(['client_admin', 'editor', 'viewer']),
});

type CreateMemberFormData = z.infer<typeof createMemberSchema>;

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onInviteSent?: () => void;
}

export function CreateMemberModal({ isOpen, onClose, clientId, onInviteSent }: CreateMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendInvite } = useClientInvites(clientId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateMemberFormData>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      role: 'viewer',
    },
  });

  const onSubmit = async (data: CreateMemberFormData) => {
    try {
      console.log('📧 Enviando convite:', data);
      setIsSubmitting(true);
      
      // Validar email manualmente
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        toast.error('E-mail inválido. Verifique o formato.');
        return;
      }
      
      await sendInvite({
        email: data.email,
        role: data.role
      });
      toast.success('Convite enviado com sucesso!');
      reset();
      onClose();
      // Chamar callback para mudar para aba de convites
      if (onInviteSent) {
        onInviteSent();
      }
    } catch (error) {
      console.error('❌ Error sending invite:', error);
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Convidar Membro por Email
          </DialogTitle>
          <DialogDescription>
            Envie um convite por email para colaborar nesta empresa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-left">E-mail *</Label>
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
            <Label htmlFor="role" className="text-left">Função</Label>
            <Select onValueChange={(value) => setValue('role', value as 'client_admin' | 'editor' | 'viewer')}>
              <SelectTrigger className="text-left">
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div className="flex items-center gap-2 text-left">
                    <span>👁️</span>
                    <div className="text-left">
                      <div className="font-medium">Visualizador</div>
                      <div className="text-xs text-muted-foreground">
                        Pode visualizar conteúdos
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div className="flex items-center gap-2 text-left">
                    <span>✏️</span>
                    <div className="text-left">
                      <div className="font-medium">Editor</div>
                      <div className="text-xs text-muted-foreground">
                        Pode criar, editar e salvar conteúdos
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="client_admin">
                  <div className="flex items-center gap-2 text-left">
                    <span>👑</span>
                    <div className="text-left">
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Como funciona:</h4>
            <div className="space-y-1 text-xs text-blue-800">
              <div>• Um convite será enviado por email para o endereço informado</div>
              <div>• Se a pessoa não tiver conta no ATMK, uma será criada automaticamente</div>
              <div>• O convite expira em 7 dias</div>
              <div>• A pessoa poderá aceitar ou recusar o convite</div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Permissões por função:</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div><strong>Visualizador:</strong> Ver conteúdos e resultados</div>
              <div><strong>Editor:</strong> + Criar, editar e salvar conteúdos</div>
              <div><strong>Administrador:</strong> + Gerenciar membros e configurações</div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando Convite...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
