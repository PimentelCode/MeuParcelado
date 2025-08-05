# Configuração do Supabase para MeuParcelado

Este guia detalha como configurar o Supabase para o projeto MeuParcelado.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Projeto MeuParcelado clonado localmente

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Escolha sua organização
4. Preencha os dados do projeto:
   - **Name**: MeuParcelado
   - **Database Password**: Crie uma senha segura (anote-a!)
   - **Region**: Escolha a região mais próxima
5. Clique em "Create new project"
6. Aguarde a criação do projeto (pode levar alguns minutos)

### 2. Configurar o Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em "New query"
3. Copie e cole o conteúdo do arquivo `sql/create-tables.sql`
4. Clique em "Run" para executar o script
5. Verifique se as tabelas foram criadas na aba **Table Editor**

### 3. Obter Credenciais do Projeto

1. Vá para **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon public** key (chave pública)

### 4. Configurar a Aplicação

1. Abra o arquivo `js/supabase-config.js`
2. Substitua as credenciais de exemplo pelas suas:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://SEU_PROJECT_ID.supabase.co',
    anonKey: 'SUA_ANON_KEY_AQUI'
};
```

### 5. Configurar Row Level Security (RLS)

O script SQL já configura as políticas de segurança, mas você pode verificar:

1. Vá para **Authentication** > **Policies**
2. Verifique se as políticas estão ativas para as tabelas `usuarios` e `contas`

### 6. Testar a Configuração

1. Abra o projeto no navegador
2. Tente fazer cadastro de um novo usuário
3. Faça login com o usuário criado
4. Crie uma nova conta/compra
5. Verifique se os dados aparecem no Supabase:
   - **Table Editor** > **usuarios**
   - **Table Editor** > **contas**

## 🔧 Configurações Avançadas

### Configurar Autenticação por Email (Opcional)

1. Vá para **Authentication** > **Settings**
2. Configure o provedor de email
3. Ative "Enable email confirmations"

### Configurar Storage para Imagens (Futuro)

1. Vá para **Storage**
2. Crie um bucket para uploads
3. Configure políticas de acesso

## 🛡️ Segurança

### Políticas RLS Configuradas

- **Usuários**: Podem ver/editar apenas seus próprios dados
- **Contas**: Usuários só acessam suas próprias contas
- **Inserção**: Permitida para novos cadastros

### Boas Práticas

- ✅ Nunca exponha a `service_role` key no frontend
- ✅ Use apenas a `anon` key no código cliente
- ✅ Mantenha as políticas RLS sempre ativas
- ✅ Use HTTPS em produção

## 🔄 Sistema de Fallback

O projeto inclui um sistema de fallback automático:

- **Prioridade 1**: Supabase (quando disponível)
- **Prioridade 2**: localStorage (quando Supabase falha)

Isso garante que a aplicação funcione mesmo se:
- Houver problemas de conectividade
- O Supabase estiver temporariamente indisponível
- As credenciais estiverem incorretas

## 📊 Monitoramento

### Verificar Logs

1. **Logs** > **Database** - Erros de SQL
2. **Logs** > **API** - Requisições da aplicação
3. **Logs** > **Auth** - Tentativas de login

### Métricas

1. **Reports** - Uso do banco de dados
2. **API** - Número de requisições
3. **Auth** - Usuários ativos

## 🚨 Solução de Problemas

### Erro: "Invalid API key"
- Verifique se a `anonKey` está correta
- Confirme se o projeto está ativo

### Erro: "Row Level Security"
- Verifique se as políticas RLS estão configuradas
- Confirme se o usuário está autenticado

### Erro: "Table doesn't exist"
- Execute novamente o script `create-tables.sql`
- Verifique se as tabelas foram criadas

### Dados não aparecem
- Verifique o console do navegador para erros
- Confirme se as políticas RLS permitem acesso
- Teste com o fallback localStorage

## 📞 Suporte

- **Documentação Supabase**: [docs.supabase.com](https://docs.supabase.com)
- **Comunidade**: [Discord do Supabase](https://discord.supabase.com)
- **Issues do Projeto**: Abra uma issue no repositório

---

**Nota**: Este projeto foi desenvolvido com foco em simplicidade e funcionalidade. Para uso em produção, considere implementar autenticação mais robusta e criptografia de senhas.