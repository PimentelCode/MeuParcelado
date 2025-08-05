// Módulo de armazenamento com Supabase
// Este módulo substitui o localStorage por Supabase Database

const supabaseStorage = {
    // Flag para indicar se está usando Supabase ou localStorage como fallback
    usingSupabase: false,
    
    // Inicializar o módulo
    async init() {
        if (window.isSupabaseAvailable && window.isSupabaseAvailable()) {
            this.usingSupabase = true;
            console.log('📊 Usando Supabase para armazenamento');
            
            // Verificar se as tabelas existem, se não, criar
            await this.ensureTablesExist();
            
            // Migrar dados do localStorage se existirem
            await this.migrateFromLocalStorage();
        } else {
            this.usingSupabase = false;
            console.log('💾 Usando localStorage como fallback');
        }
    },

    // Verificar e criar tabelas necessárias
    async ensureTablesExist() {
        try {
            // Verificar se a tabela de usuários existe
            const { data: users, error: usersError } = await window.supabaseClient
                .from('usuarios')
                .select('id')
                .limit(1);

            // Verificar se a tabela de contas existe
            const { data: contas, error: contasError } = await window.supabaseClient
                .from('contas')
                .select('id')
                .limit(1);

            if (usersError || contasError) {
                console.warn('⚠️ Algumas tabelas não existem. Execute o script SQL de criação das tabelas.');
                console.log('📋 Veja o arquivo sql/create-tables.sql para criar as tabelas necessárias.');
            }
        } catch (error) {
            console.error('❌ Erro ao verificar tabelas:', error);
        }
    },

    // Migrar dados do localStorage para Supabase
    async migrateFromLocalStorage() {
        if (!this.usingSupabase) return;

        try {
            // Migrar usuários
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            if (usuarios.length > 0) {
                console.log('🔄 Migrando usuários do localStorage...');
                for (const usuario of usuarios) {
                    await this.salvarUsuario(usuario);
                }
            }

            // Migrar contas de todos os usuários
            for (const key of Object.keys(localStorage)) {
                if (key.startsWith('contas_')) {
                    const email = key.replace('contas_', '');
                    const contas = JSON.parse(localStorage.getItem(key) || '[]');
                    
                    if (contas.length > 0) {
                        console.log(`🔄 Migrando contas do usuário ${email}...`);
                        for (const conta of contas) {
                            conta.usuario_email = email;
                            await this.salvarConta(conta);
                        }
                    }
                }
            }

            console.log('✅ Migração concluída com sucesso!');
        } catch (error) {
            console.error('❌ Erro durante a migração:', error);
        }
    },

    // Salvar usuário
    async salvarUsuario(usuario) {
        if (!this.usingSupabase) {
            // Fallback para localStorage
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            const existingIndex = usuarios.findIndex(u => u.email === usuario.email);
            
            if (existingIndex !== -1) {
                usuarios[existingIndex] = usuario;
            } else {
                usuarios.push(usuario);
            }
            
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            return { success: true };
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('usuarios')
                .upsert({
                    email: usuario.email,
                    nome: usuario.nome,
                    senha_hash: usuario.senha, // Em produção, use hash da senha
                    created_at: new Date().toISOString()
                }, {
                    onConflict: 'email'
                });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Erro ao salvar usuário:', error);
            return { success: false, error };
        }
    },

    // Buscar usuário por email e senha
    async buscarUsuario(email, senha) {
        if (!this.usingSupabase) {
            // Fallback para localStorage
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            return usuarios.find(u => u.email === email && u.senha === senha) || null;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .eq('senha_hash', senha) // Em produção, compare com hash
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data || null;
        } catch (error) {
            console.error('❌ Erro ao buscar usuário:', error);
            return null;
        }
    },

    // Salvar conta
    async salvarConta(conta) {
        if (!this.usingSupabase) {
            // Fallback para localStorage
            const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
            if (!usuarioAtual) return { success: false, error: 'Usuário não logado' };
            
            const chaveDados = `contas_${usuarioAtual.email}`;
            let contas = JSON.parse(localStorage.getItem(chaveDados) || '[]');
            
            if (!conta.id) {
                conta.id = Date.now().toString();
                contas.push(conta);
            } else {
                const index = contas.findIndex(c => c.id === conta.id);
                if (index !== -1) {
                    contas[index] = conta;
                } else {
                    contas.push(conta);
                }
            }
            
            localStorage.setItem(chaveDados, JSON.stringify(contas));
            return { success: true };
        }

        try {
            // Preparar dados da conta
            const contaData = {
                id: conta.id || null,
                usuario_email: conta.usuario_email,
                descricao: conta.descricao,
                valor: parseFloat(conta.valor),
                tipo_pagamento: conta.tipoPagamento,
                numero_parcelas: conta.numeroParcelas || 1,
                status: conta.status || 'pendente',
                data_compra: conta.dataCompra,
                data_pagamento: conta.dataPagamento || null,
                parcelas: conta.parcelas ? JSON.stringify(conta.parcelas) : null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await window.supabaseClient
                .from('contas')
                .upsert(contaData, {
                    onConflict: 'id'
                })
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Erro ao salvar conta:', error);
            return { success: false, error };
        }
    },

    // Buscar contas do usuário
    async buscarContas(userEmail) {
        if (!this.usingSupabase) {
            // Fallback para localStorage
            const chaveDados = `contas_${userEmail}`;
            return JSON.parse(localStorage.getItem(chaveDados) || '[]');
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('contas')
                .select('*')
                .eq('usuario_email', userEmail)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Converter dados do Supabase para formato esperado pelo frontend
            return data.map(conta => ({
                id: conta.id,
                descricao: conta.descricao,
                valor: conta.valor,
                tipoPagamento: conta.tipo_pagamento,
                numeroParcelas: conta.numero_parcelas,
                status: conta.status,
                dataCompra: conta.data_compra,
                dataPagamento: conta.data_pagamento,
                parcelas: conta.parcelas ? JSON.parse(conta.parcelas) : null
            }));
        } catch (error) {
            console.error('❌ Erro ao buscar contas:', error);
            return [];
        }
    },

    // Buscar conta por ID
    async buscarConta(id, userEmail) {
        if (!this.usingSupabase) {
            // Fallback para localStorage
            const contas = await this.buscarContas(userEmail);
            return contas.find(conta => conta.id == id) || null;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('contas')
                .select('*')
                .eq('id', id)
                .eq('usuario_email', userEmail)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            
            if (!data) return null;
            
            // Converter dados do Supabase para formato esperado
            return {
                id: data.id,
                descricao: data.descricao,
                valor: data.valor,
                tipoPagamento: data.tipo_pagamento,
                numeroParcelas: data.numero_parcelas,
                status: data.status,
                dataCompra: data.data_compra,
                dataPagamento: data.data_pagamento,
                parcelas: data.parcelas ? JSON.parse(data.parcelas) : null
            };
        } catch (error) {
            console.error('❌ Erro ao buscar conta:', error);
            return null;
        }
    },

    // Deletar conta
    async deletarConta(id, userEmail) {
        if (!this.usingSupabase) {
            // Fallback para localStorage
            const chaveDados = `contas_${userEmail}`;
            let contas = JSON.parse(localStorage.getItem(chaveDados) || '[]');
            contas = contas.filter(conta => conta.id != id);
            localStorage.setItem(chaveDados, JSON.stringify(contas));
            return { success: true };
        }

        try {
            const { error } = await window.supabaseClient
                .from('contas')
                .delete()
                .eq('id', id)
                .eq('usuario_email', userEmail);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao deletar conta:', error);
            return { success: false, error };
        }
    },

    // Métodos de compatibilidade com o storage atual
    setItem(key, value) {
        if (key === 'usuarioAtual') {
            localStorage.setItem(key, JSON.stringify(value));
        }
    },

    getItem(key) {
        if (key === 'usuarioAtual') {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        return null;
    },

    removeItem(key) {
        localStorage.removeItem(key);
    },

    // Atualizar conta existente
    async atualizarConta(conta) {
        if (!this.usingSupabase) {
            throw new Error('Supabase não disponível para atualização');
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('contas')
                .update({
                    descricao: conta.descricao,
                    valor: parseFloat(conta.valor),
                    tipo_pagamento: conta.tipoPagamento,
                    numero_parcelas: conta.numeroParcelas || 1,
                    status: conta.status,
                    data_compra: conta.dataCompra,
                    data_pagamento: conta.dataPagamento || null,
                    parcelas: conta.parcelas || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', conta.id)
                .eq('usuario_email', conta.usuarioEmail);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Erro ao atualizar conta:', error);
            throw error;
        }
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => supabaseStorage.init(), 100);
    });
} else {
    setTimeout(() => supabaseStorage.init(), 100);
}

// Exportar para uso global
window.supabaseStorage = supabaseStorage;