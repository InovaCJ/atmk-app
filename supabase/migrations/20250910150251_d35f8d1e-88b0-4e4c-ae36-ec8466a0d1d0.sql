-- Reabilitar signup e desabilitar confirmação de email
-- Essas configurações são aplicadas via SQL quando possível

-- Verificar e ajustar configurações de auth se necessário
-- Note: Algumas configurações só podem ser alteradas via dashboard

-- Garantir que a tabela de profiles está configurada corretamente
-- e que o trigger para criar profiles está funcionando

-- Verificar se o trigger para novos usuários existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created' 
        AND tgrelid = 'auth.users'::regclass
    ) THEN
        -- Criar trigger se não existir
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;