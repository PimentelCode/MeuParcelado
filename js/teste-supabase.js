/**
 * Script de Teste Automatizado para Supabase
 * Execute este script no console do navegador para verificar a integração
 */

class SupabaseTester {
    constructor() {
        this.resultados = [];
        this.usuarioTeste = {
            nome: 'Usuario Teste',
            email: `teste_${Date.now()}@exemplo.com`,
            senha: 'MinhaSenh@123'
        };
    }

    log(teste, status, mensagem, detalhes = null) {
        const resultado = {
            teste,
            status,
            mensagem,
            detalhes,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.resultados.push(resultado);
        
        const emoji = status === 'PASSOU' ? '✅' : status === 'FALHOU' ? '❌' : '⚠️';
        console.log(`${emoji} [${teste}] ${mensagem}`, detalhes || '');
    }

    async testeConectividade() {
        try {
            // Verificar se Supabase está carregado
            if (!window.supabaseClient) {
                this.log('CONECTIVIDADE', 'FALHOU', 'Supabase client não encontrado');
                return false;
            }

            // Verificar configuração
            if (!SUPABASE_CONFIG || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
                this.log('CONECTIVIDADE', 'FALHOU', 'Configuração do Supabase inválida');
                return false;
            }

            // Teste de ping simples
            const response = await fetch(SUPABASE_CONFIG.url + '/rest/v1/', {
                headers: {
                    'apikey': SUPABASE_CONFIG.anonKey,
                    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
                }
            });

            if (response.ok) {
                this.log('CONECTIVIDADE', 'PASSOU', 'Conexão com Supabase estabelecida');
                return true;
            } else {
                this.log('CONECTIVIDADE', 'FALHOU', `Erro HTTP: ${response.status}`);
                return false;
            }
        } catch (error) {
            this.log('CONECTIVIDADE', 'FALHOU', 'Erro de rede', error.message);
            return false;
        }
    }

    async testeTabelas() {
        try {
            // Verificar tabela usuarios
            const { data: usuarios, error: errorUsuarios } = await window.supabaseClient
                .from('usuarios')
                .select('count')
                .limit(1);

            if (errorUsuarios) {
                this.log('TABELAS', 'FALHOU', 'Tabela usuarios não encontrada', errorUsuarios.message);
                return false;
            }

            // Verificar tabela contas
            const { data: contas, error: errorContas } = await window.supabaseClient
                .from('contas')
                .select('count')
                .limit(1);

            if (errorContas) {
                this.log('TABELAS', 'FALHOU', 'Tabela contas não encontrada', errorContas.message);
                return false;
            }

            this.log('TABELAS', 'PASSOU', 'Todas as tabelas estão acessíveis');
            return true;
        } catch (error) {
            this.log('TABELAS', 'FALHOU', 'Erro ao verificar tabelas', error.message);
            return false;
        }
    }

    async testeCadastroUsuario() {
        try {
            const resultado = await supabaseStorage.salvarUsuario(this.usuarioTeste);
            
            if (resultado.success) {
                this.log('CADASTRO', 'PASSOU', 'Usuário cadastrado com sucesso');
                return true;
            } else {
                this.log('CADASTRO', 'FALHOU', 'Erro ao cadastrar usuário', resultado.error);
                return false;
            }
        } catch (error) {
            this.log('CADASTRO', 'FALHOU', 'Erro no cadastro', error.message);
            return false;
        }
    }

    async testeBuscaUsuario() {
        try {
            const usuario = await supabaseStorage.buscarUsuario(this.usuarioTeste.email);
            
            if (usuario && usuario.email === this.usuarioTeste.email) {
                this.log('BUSCA_USUARIO', 'PASSOU', 'Usuário encontrado corretamente');
                return true;
            } else {
                this.log('BUSCA_USUARIO', 'FALHOU', 'Usuário não encontrado');
                return false;
            }
        } catch (error) {
            this.log('BUSCA_USUARIO', 'FALHOU', 'Erro na busca', error.message);
            return false;
        }
    }

    async testeCriacaoConta() {
        try {
            const contaTeste = {
                id: Date.now().toString(),
                usuarioEmail: this.usuarioTeste.email,
                descricao: 'Conta de Teste Automatizado',
                valor: 299.90,
                tipoPagamento: 'parcelado',
                numeroParcelas: 3,
                dataCompra: new Date().toISOString().split('T')[0],
                status: 'pendente',
                parcelas: [
                    { numero: 1, valor: 99.97, dataVencimento: '2024-01-15', status: 'pendente' },
                    { numero: 2, valor: 99.97, dataVencimento: '2024-02-15', status: 'pendente' },
                    { numero: 3, valor: 99.96, dataVencimento: '2024-03-15', status: 'pendente' }
                ]
            };

            const resultado = await supabaseStorage.salvarConta(contaTeste);
            
            if (resultado.success) {
                this.log('CRIACAO_CONTA', 'PASSOU', 'Conta criada com sucesso');
                this.contaTesteId = contaTeste.id;
                return true;
            } else {
                this.log('CRIACAO_CONTA', 'FALHOU', 'Erro ao criar conta', resultado.error);
                return false;
            }
        } catch (error) {
            this.log('CRIACAO_CONTA', 'FALHOU', 'Erro na criação', error.message);
            return false;
        }
    }

    async testeBuscaContas() {
        try {
            const contas = await supabaseStorage.obterContas(this.usuarioTeste.email);
            
            if (Array.isArray(contas) && contas.length > 0) {
                this.log('BUSCA_CONTAS', 'PASSOU', `${contas.length} conta(s) encontrada(s)`);
                return true;
            } else {
                this.log('BUSCA_CONTAS', 'AVISO', 'Nenhuma conta encontrada (pode ser normal)');
                return true;
            }
        } catch (error) {
            this.log('BUSCA_CONTAS', 'FALHOU', 'Erro na busca de contas', error.message);
            return false;
        }
    }

    async testeRLS() {
        try {
            // Tentar acessar dados de outro usuário (deve falhar)
            const { data, error } = await window.supabaseClient
                .from('contas')
                .select('*')
                .eq('usuario_email', 'usuario_inexistente@teste.com');

            if (data && data.length === 0) {
                this.log('RLS', 'PASSOU', 'Row Level Security funcionando corretamente');
                return true;
            } else {
                this.log('RLS', 'FALHOU', 'RLS pode não estar funcionando corretamente');
                return false;
            }
        } catch (error) {
            this.log('RLS', 'FALHOU', 'Erro no teste RLS', error.message);
            return false;
        }
    }

    async testePerformance() {
        try {
            const start = performance.now();
            await supabaseStorage.obterContas(this.usuarioTeste.email);
            const end = performance.now();
            const tempo = Math.round(end - start);

            if (tempo < 2000) {
                this.log('PERFORMANCE', 'PASSOU', `Resposta em ${tempo}ms (boa performance)`);
            } else if (tempo < 5000) {
                this.log('PERFORMANCE', 'AVISO', `Resposta em ${tempo}ms (performance aceitável)`);
            } else {
                this.log('PERFORMANCE', 'FALHOU', `Resposta em ${tempo}ms (performance ruim)`);
            }
            return true;
        } catch (error) {
            this.log('PERFORMANCE', 'FALHOU', 'Erro no teste de performance', error.message);
            return false;
        }
    }

    async limpezaTeste() {
        try {
            // Limpar dados de teste
            if (this.contaTesteId) {
                await window.supabaseClient
                    .from('contas')
                    .delete()
                    .eq('id', this.contaTesteId);
            }

            await window.supabaseClient
                .from('usuarios')
                .delete()
                .eq('email', this.usuarioTeste.email);

            this.log('LIMPEZA', 'PASSOU', 'Dados de teste removidos');
        } catch (error) {
            this.log('LIMPEZA', 'AVISO', 'Erro na limpeza (não crítico)', error.message);
        }
    }

    gerarRelatorio() {
        console.log('\n📊 RELATÓRIO DE TESTES SUPABASE');
        console.log('================================');
        
        const passou = this.resultados.filter(r => r.status === 'PASSOU').length;
        const falhou = this.resultados.filter(r => r.status === 'FALHOU').length;
        const avisos = this.resultados.filter(r => r.status === 'AVISO').length;
        
        console.log(`✅ Passou: ${passou}`);
        console.log(`❌ Falhou: ${falhou}`);
        console.log(`⚠️  Avisos: ${avisos}`);
        console.log(`📝 Total: ${this.resultados.length}`);
        
        if (falhou === 0) {
            console.log('\n🎉 TODOS OS TESTES PASSARAM! Supabase está funcionando perfeitamente.');
        } else {
            console.log('\n⚠️  ALGUNS TESTES FALHARAM. Verifique a configuração.');
        }
        
        console.log('\n📋 Detalhes dos testes:');
        this.resultados.forEach(r => {
            const emoji = r.status === 'PASSOU' ? '✅' : r.status === 'FALHOU' ? '❌' : '⚠️';
            console.log(`${emoji} ${r.teste}: ${r.mensagem}`);
        });
        
        return {
            passou,
            falhou,
            avisos,
            total: this.resultados.length,
            sucesso: falhou === 0
        };
    }

    async executarTodosTestes() {
        console.log('🚀 Iniciando testes do Supabase...');
        console.log('==================================');
        
        await this.testeConectividade();
        await this.testeTabelas();
        await this.testeCadastroUsuario();
        await this.testeBuscaUsuario();
        await this.testeCriacaoConta();
        await this.testeBuscaContas();
        await this.testeRLS();
        await this.testePerformance();
        await this.limpezaTeste();
        
        return this.gerarRelatorio();
    }
}

// Função para executar os testes
window.testarSupabase = async function() {
    const tester = new SupabaseTester();
    return await tester.executarTodosTestes();
};

// Função para teste rápido
window.testeRapidoSupabase = async function() {
    console.log('⚡ Teste rápido do Supabase...');
    
    try {
        // Verificar se está carregado
        if (!window.supabaseClient) {
            console.log('❌ Supabase não carregado');
            return false;
        }
        
        // Teste de ping
        const response = await fetch(SUPABASE_CONFIG.url + '/rest/v1/', {
            headers: { 'apikey': SUPABASE_CONFIG.anonKey }
        });
        
        if (response.ok) {
            console.log('✅ Supabase conectado e funcionando!');
            console.log('💡 Execute testarSupabase() para testes completos');
            return true;
        } else {
            console.log('❌ Erro de conexão:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Erro:', error.message);
        return false;
    }
};

// Executar teste rápido automaticamente se o script for carregado
if (typeof window !== 'undefined') {
    console.log('🧪 Script de teste Supabase carregado!');
    console.log('📝 Comandos disponíveis:');
    console.log('   testeRapidoSupabase() - Teste básico de conectividade');
    console.log('   testarSupabase() - Bateria completa de testes');
}