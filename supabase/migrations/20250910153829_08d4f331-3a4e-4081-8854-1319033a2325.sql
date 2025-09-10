-- Reabilitar configurações de signup e email
-- Esta migração garante que as configurações corretas estejam aplicadas

-- Note: As configurações principais de signup devem ser habilitadas via dashboard
-- Mas vamos garantir que não há restrições adicionais no banco

-- Verificar se há políticas ou configurações que possam estar bloqueando
-- o signup na tabela auth.users (se acessível)

-- Garantir que a função handle_new_user está correta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Se houver erro, apenas continue sem falhar o signup
    RETURN new;
END;
$$;

-- Recriar o trigger se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Garantir que a tabela profiles pode receber dados
ALTER TABLE public.profiles 
  ALTER COLUMN full_name DROP NOT NULL,
  ALTER COLUMN phone DROP NOT NULL;