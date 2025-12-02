-- Criar a tabela de fila de automação
CREATE TABLE automation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
  automation_run_id UUID REFERENCES automation_runs(id) ON DELETE CASCADE NOT NULL,
  generated_content_id UUID REFERENCES generated_content(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  retry_count INT NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para otimizar a busca de itens pendentes (o "polling")
CREATE INDEX idx_automation_queue_poll 
ON automation_queue(created_at) 
WHERE status IN ('pending', 'failed') AND retry_count < 3;

GRANT ALL PRIVILEGES ON TABLE automation_queue TO service_role;
ALTER TABLE automation_queue ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON TABLE automation_queue TO authenticated;

CREATE POLICY "Read automation_queue"
ON automation_queue
FOR SELECT
USING (
  -- SELECT 1: usuário é o criador da automação
  EXISTS (
    SELECT 1
    FROM public.automations a
    WHERE a.id = automation_queue.automation_id
      AND a.created_by = auth.uid()
  )

  OR

  -- SELECT 2: usuário é membro do mesmo client da automação
  EXISTS (
    SELECT 1
    FROM public.automations a
    JOIN public.client_members cm ON cm.client_id = a.client_id
    WHERE a.id = automation_queue.automation_id
      AND cm.user_id = auth.uid()
  )
);


