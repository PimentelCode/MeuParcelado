-- Script SQL para criar as tabelas necessárias no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL, -- Em produção, armazene apenas o hash da senha
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de contas/compras
CREATE TABLE IF NOT EXISTS contas (
    id BIGSERIAL PRIMARY KEY,
    usuario_email VARCHAR(255) NOT NULL REFERENCES usuarios(email) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    tipo_pagamento VARCHAR(20) NOT NULL CHECK (tipo_pagamento IN ('avista', 'parcelado')),
    numero_parcelas INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
    data_compra DATE NOT NULL,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    parcelas JSONB, -- Armazenar detalhes das parcelas em JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_contas_usuario_email ON contas(usuario_email);
CREATE INDEX IF NOT EXISTS idx_contas_status ON contas(status);
CREATE INDEX IF NOT EXISTS idx_contas_data_compra ON contas(data_compra);
CREATE INDEX IF NOT EXISTS idx_contas_tipo_pagamento ON contas(tipo_pagamento);

-- Habilitar Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para usuários
-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON usuarios
    FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Permitir inserção de novos usuários (para cadastro)
CREATE POLICY "Permitir cadastro de usuários" ON usuarios
    FOR INSERT WITH CHECK (true);

-- Políticas de segurança para contas
-- Usuários podem ver apenas suas próprias contas
CREATE POLICY "Usuários podem ver suas próprias contas" ON contas
    FOR SELECT USING (auth.jwt() ->> 'email' = usuario_email);

-- Usuários podem inserir contas para si mesmos
CREATE POLICY "Usuários podem criar suas próprias contas" ON contas
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = usuario_email);

-- Usuários podem atualizar apenas suas próprias contas
CREATE POLICY "Usuários podem atualizar suas próprias contas" ON contas
    FOR UPDATE USING (auth.jwt() ->> 'email' = usuario_email);

-- Usuários podem deletar apenas suas próprias contas
CREATE POLICY "Usuários podem deletar suas próprias contas" ON contas
    FOR DELETE USING (auth.jwt() ->> 'email' = usuario_email);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_updated_at BEFORE UPDATE ON contas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns dados de exemplo (opcional)
-- ATENÇÃO: Remova ou modifique estes dados em produção
INSERT INTO usuarios (email, nome, senha_hash) VALUES 
    ('demo@exemplo.com', 'Usuário Demo', 'demo123')
ON CONFLICT (email) DO NOTHING;

-- Comentários sobre as tabelas
COMMENT ON TABLE usuarios IS 'Tabela para armazenar dados dos usuários do sistema';
COMMENT ON TABLE contas IS 'Tabela para armazenar as contas/compras dos usuários';

COMMENT ON COLUMN usuarios.senha_hash IS 'Hash da senha do usuário (use bcrypt em produção)';
COMMENT ON COLUMN contas.parcelas IS 'Detalhes das parcelas em formato JSON';
COMMENT ON COLUMN contas.tipo_pagamento IS 'Tipo de pagamento: avista ou parcelado';
COMMENT ON COLUMN contas.status IS 'Status da conta: pendente, pago ou cancelado';

-- Verificar se as tabelas foram criadas com sucesso
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('usuarios', 'contas')
ORDER BY tablename;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('usuarios', 'contas')
ORDER BY tablename, policyname;