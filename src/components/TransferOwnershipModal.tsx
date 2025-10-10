import React, { useState } from 'react';
import { Crown, AlertTriangle, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useClientMembers } from '@/hooks/useClientMembers';
import { useAuth } from '@/contexts/AuthContext';
import { ClientMember } from '@/types/clients';
import { toast } from 'sonner';

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  targetMember: ClientMember | null;
}

export function TransferOwnershipModal({ 
  isOpen, 
  onClose, 
  clientId, 
  targetMember 
}: TransferOwnershipModalProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const { transferOwnership } = useClientMembers(clientId);
  const { user } = useAuth();

  const handleTransfer = async () => {
    if (!targetMember) return;
    
    try {
      setIsTransferring(true);
      await transferOwnership(targetMember.id);
      toast.success('Propriedade transferida com sucesso!');
      onClose();
    } catch (error) {
      console.error('Error transferring ownership:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao transferir propriedade';
      toast.error(errorMessage);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Transferir Propriedade da Empresa
          </DialogTitle>
          <DialogDescription>
            Você está prestes a transferir a propriedade desta empresa para outro membro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. 
              Você perderá o controle administrativo da empresa.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Transferir para:</h3>
              <div className="flex items-center justify-center space-x-3 p-4 bg-muted/50 rounded-lg">
                <Avatar>
                  <AvatarImage src={targetMember?.user?.avatar_url} />
                  <AvatarFallback>
                    {targetMember?.user?.full_name?.charAt(0) || targetMember?.user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-medium">
                    {targetMember?.user?.full_name || 'Nome não informado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {targetMember?.user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">O que acontecerá:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>{targetMember?.user?.full_name || targetMember?.user?.email}</strong> se tornará o novo administrador</li>
                <li>• Você será rebaixado para Editor</li>
                <li>• O novo administrador poderá gerenciar todos os aspectos da empresa</li>
                <li>• Você não poderá mais adicionar/remover membros</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Limitações após a transferência:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Você não poderá mais transferir propriedade</li>
                <li>• Apenas o novo administrador poderá gerenciar membros</li>
                <li>• Você manterá acesso de Editor (pode editar conteúdos)</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleTransfer}
              disabled={isTransferring}
            >
              {isTransferring ? 'Transferindo...' : 'Confirmar Transferência'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
