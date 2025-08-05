# MeuParcelado - Sistema de Controle de Compras Parceladas

Um sistema web completo para gerenciar suas compras parceladas, agora integrado com **Supabase** para armazenamento em nuvem.

## 🚀 Funcionalidades

- ✅ **Cadastro e Login de Usuários**
- ✅ **Gerenciamento de Compras Parceladas**
- ✅ **Dashboard com Resumo Financeiro**
- ✅ **Filtros e Busca Avançada**
- ✅ **Controle de Parcelas Pagas/Pendentes**
- ✅ **Armazenamento em Nuvem (Supabase)**
- ✅ **Fallback para localStorage**
- ✅ **Interface Responsiva**

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com Flexbox/Grid
- **JavaScript ES6+** - Lógica da aplicação
- **Font Awesome** - Ícones

### Backend/Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança de dados

### Fallback
- **localStorage** - Armazenamento local como backup

## 📋 Pré-requisitos

1. **Conta no Supabase** (gratuita)
2. **Navegador moderno** com suporte a ES6+
3. **Servidor web local** (opcional, para desenvolvimento)

## ⚙️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha:
   - **Name**: `meu-parcelado`
   - **Database Password**: (escolha uma senha forte)
   - **Region**: `South America (São Paulo)` (recomendado para Brasil)
6. Clique em "Create new project"

### 2. Configurar Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Copie e execute o conteúdo do arquivo `sql/create-tables.sql`
3. Verifique se as tabelas foram criadas:
   - `usuarios`
   - `contas`

### 3. Obter Credenciais

1. Vá para **Settings** > **API**
2. Copie:
   - **Project URL**
   - **anon public key**

### 4. Configurar Aplicação

1. Abra o arquivo `js/supabase-config.js`
2. Substitua os valores padrão:

```javascript
const SUPABASE_URL = 'SUA_URL_DO_SUPABASE_AQUI';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANONIMA_AQUI';
```

**Exemplo:**
```javascript
const SUPABASE_URL = 'https://xyzabc123.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## 🚀 Como usar

1. **Clone o repositório**:

```bash
git clone https://github.com/SRGODIN/meuparcelado.git

