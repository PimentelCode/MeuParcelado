# 🧪 Como Testar se o Supabase Está Funcionando

Este guia te ajudará a verificar se a integração do Supabase está funcionando corretamente no projeto MeuParcelado.

## 🚀 Como Testar a Integração

### Método 1: Interface de Teste Automatizada (Recomendado)

1. **Abra o arquivo de teste no navegador:**
   ```
   http://localhost/MeuParcelado/teste-supabase.html
   ```
   ou abra diretamente o arquivo `teste-supabase.html`

2. **Execute os testes:**
   - **Teste Rápido**: Verifica conectividade básica
   - **Testes Completos**: Bateria completa de verificações
   - **Testes Específicos**: Tabelas, autenticação, performance

3. **Analise os resultados:**
   - ✅ Verde = Teste passou
   - ❌ Vermelho = Teste falhou
   - ⚠️ Amarelo = Aviso (não crítico)

### Método 2: Console do Navegador

1. **Abra qualquer página da aplicação**
2. **Abra o Console (F12)**
3. **Execute os comandos:**
   ```javascript
   // Teste rápido
   testeRapidoSupabase()
   
   // Testes completos
   testarSupabase()
   ```

### Método 3: Verificação Manual

## ✅ Checklist de Verificação

### 1. 🔧 Verificação Inicial

**Antes de começar, confirme:**
- [ ] Projeto criado no Supabase
- [ ] Script SQL executado (`sql/create-tables.sql`)
- [ ] Credenciais configuradas em `js/supabase-config.js`
- [ ] Aplicação rodando em servidor local

### 2. 🌐 Teste de Conectividade

**Abra o Console do Navegador (F12) e execute:**

```javascript
// Teste 1: Verificar se o Supabase está carregado
console.log('Supabase Client:', window.supabaseClient);

// Teste 2: Verificar configuração
console.log('Config:', SUPABASE_CONFIG);

// Teste 3: Teste de conexão simples
window.supabaseClient.from('usuarios').select('count').then(console.log);
```

**Resultado Esperado:**
- ✅ Objeto supabaseClient deve aparecer
- ✅ Config deve mostrar sua URL e chave
- ✅ Query deve retornar sem erro (mesmo que vazio)

### 3. 👤 Teste de Cadastro de Usuário

**Passo a passo:**
1. Acesse a página de cadastro
2. Preencha o formulário:
   - **Nome**: Teste Usuario
   - **Email**: teste@exemplo.com
   - **Senha**: MinhaSenh@123
   - **Confirmar Senha**: MinhaSenh@123
3. Clique em "Cadastrar"

**Verificações:**
- [ ] Formulário aceita dados válidos
- [ ] Mensagem de sucesso aparece
- [ ] Redirecionamento para login acontece
- [ ] No console: sem erros relacionados ao Supabase

**Verificar no Supabase:**
1. Acesse seu projeto no Supabase
2. Vá em **Table Editor** > **usuarios**
3. Confirme se o usuário foi criado

### 4. 🔐 Teste de Login

**Passo a passo:**
1. Na página de login, use:
   - **Email**: teste@exemplo.com
   - **Senha**: MinhaSenh@123
2. Clique em "Entrar"

**Verificações:**
- [ ] Login aceito sem erros
- [ ] Redirecionamento para dashboard
- [ ] Nome do usuário aparece no header
- [ ] No console: "✅ Login realizado com sucesso"

### 5. 💳 Teste de Criação de Conta

**Passo a passo:**
1. Acesse "Nova Conta"
2. Preencha:
   - **Descrição**: Teste de Compra
   - **Valor**: 299.90
   - **Tipo**: Parcelado
   - **Parcelas**: 3x
   - **Data**: Data atual
3. Clique em "Salvar"

**Verificações:**
- [ ] Conta criada com sucesso
- [ ] Redirecionamento para lista de contas
- [ ] Conta aparece na listagem
- [ ] No console: "✅ Conta salva com sucesso"

**Verificar no Supabase:**
1. **Table Editor** > **contas**
2. Confirme se a conta foi criada
3. Verifique se o campo `parcelas` contém JSON válido

### 6. 📋 Teste de Listagem de Contas

**Verificações:**
- [ ] Contas carregam automaticamente
- [ ] Filtros funcionam (Todas, Pendentes, Pagas)
- [ ] Busca por descrição funciona
- [ ] Totais são calculados corretamente

### 7. ✏️ Teste de Edição de Conta

**Passo a passo:**
1. Na lista de contas, clique em "Editar"
2. Modifique a descrição para "Teste Editado"
3. Salve as alterações

**Verificações:**
- [ ] Formulário carrega com dados existentes
- [ ] Alterações são salvas
- [ ] Lista atualiza com novos dados

### 8. 🚪 Teste de Logout

**Verificações:**
- [ ] Botão de logout funciona
- [ ] Redirecionamento para página inicial
- [ ] Tentativa de acessar páginas protegidas redireciona para login

## 🔍 Verificação no Console do Navegador

### Mensagens de Sucesso Esperadas:
```
✅ Supabase inicializado com sucesso
✅ Usuário cadastrado com sucesso
✅ Login realizado com sucesso
✅ Conta salva com sucesso
✅ Contas carregadas do Supabase
✅ Logout realizado com sucesso
```

### Verificar Dados no Supabase Dashboard

**Tabela `usuarios`:**
```sql
SELECT id, email, nome, created_at FROM usuarios;
```

**Tabela `contas`:**
```sql
SELECT id, usuario_email, descricao, valor, tipo_pagamento, parcelas FROM contas;
```

## 🚨 Problemas Comuns e Soluções

### ❌ Erro: "Invalid API key"
**Solução:**
1. Verifique `js/supabase-config.js`
2. Confirme se a `anonKey` está correta
3. Verifique se o projeto Supabase está ativo

### ❌ Erro: "Row Level Security"
**Solução:**
1. Execute novamente o script SQL
2. Verifique se as políticas RLS estão ativas
3. Confirme se o usuário está logado

### ❌ Dados não aparecem
**Solução:**
1. Verifique o console para erros
2. Confirme se as tabelas existem
3. Teste com dados de exemplo

### ❌ Fallback para localStorage
**Isso é normal quando:**
- Supabase está indisponível
- Credenciais incorretas
- Problemas de rede

**Verificar:**
```javascript
// No console
console.log('Usando Supabase:', supabaseStorage.usingSupabase);
```

## 🧪 Testes Avançados

### Teste de Performance
```javascript
// Medir tempo de resposta
const start = performance.now();
supabaseStorage.obterContas('teste@exemplo.com').then(() => {
    const end = performance.now();
    console.log(`Tempo de resposta: ${end - start}ms`);
});
```

### Teste de Conectividade
```javascript
// Verificar status da conexão
fetch(SUPABASE_CONFIG.url + '/rest/v1/', {
    headers: {
        'apikey': SUPABASE_CONFIG.anonKey
    }
}).then(response => {
    console.log('Status Supabase:', response.status);
});
```

### Teste de Políticas RLS
```javascript
// Tentar acessar dados de outro usuário (deve falhar)
window.supabaseClient
    .from('contas')
    .select('*')
    .eq('usuario_email', 'outro@email.com')
    .then(result => {
        console.log('Teste RLS:', result.data.length === 0 ? 'PASSOU' : 'FALHOU');
    });
```

## 📊 Monitoramento Contínuo

### No Supabase Dashboard:
1. **Logs** > **API** - Verificar requisições
2. **Logs** > **Database** - Verificar queries
3. **Reports** - Monitorar uso

### Métricas Importantes:
- Número de usuários cadastrados
- Número de contas criadas
- Tempo de resposta das queries
- Taxa de erro das requisições

## ✅ Checklist Final

- [ ] Cadastro funcionando
- [ ] Login funcionando
- [ ] Criação de contas funcionando
- [ ] Listagem funcionando
- [ ] Edição funcionando
- [ ] Logout funcionando
- [ ] Dados persistindo no Supabase
- [ ] Fallback para localStorage funcionando
- [ ] Console sem erros críticos
- [ ] Políticas RLS ativas

**Se todos os itens estão ✅, sua integração Supabase está funcionando perfeitamente!**

---

💡 **Dica**: Mantenha o console do navegador aberto durante os testes para acompanhar logs e identificar problemas rapidamente.