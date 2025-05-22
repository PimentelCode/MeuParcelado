// Módulo para gerenciar o armazenamento local
const storage = {
    // Salvar item no localStorage
    setItem: function(chave, valor) {
        localStorage.setItem(chave, JSON.stringify(valor));
    },
    
    // Obter item do localStorage
    getItem: function(chave) {
        const item = localStorage.getItem(chave);
        return item ? JSON.parse(item) : null;
    },
    
    // Remover item do localStorage
    removeItem: function(chave) {
        localStorage.removeItem(chave);
    },
    
    // Gerar ID único para conta
    gerarIdUnico: function() {
        return Date.now();
    },
    
    // Salvar conta do usuário
    salvarConta: function(conta) {
        const usuarioAtual = this.getItem('usuarioAtual');
        if (!usuarioAtual) return false;
        
        const chaveDados = `contas_${usuarioAtual.email}`;
        let contas = this.getItem(chaveDados) || [];
        
        // Verificar se é uma nova conta ou atualização
        if (!conta.id) {
            // Nova conta - gerar ID único
            conta.id = this.gerarIdUnico();
            contas.push(conta);
        } else {
            // Atualização - encontrar e substituir
            const index = contas.findIndex(c => c.id === conta.id);
            if (index !== -1) {
                contas[index] = conta;
            } else {
                contas.push(conta);
            }
        }
        
        this.setItem(chaveDados, contas);
        return true;
    },
    
    // Obter todas as contas do usuário atual
    getContas: function() {
        const usuarioAtual = this.getItem('usuarioAtual');
        if (!usuarioAtual) return [];
        
        const chaveDados = `contas_${usuarioAtual.email}`;
        return this.getItem(chaveDados) || [];
    },
    
    // Obter conta específica pelo ID
    getConta: function(id) {
        const contas = this.getContas();
        return contas.find(conta => conta.id === id);
    },
    
    // Excluir conta pelo ID
    deletarConta: function(id) {
        const usuarioAtual = this.getItem('usuarioAtual');
        if (!usuarioAtual) return false;
        
        const chaveDados = `contas_${usuarioAtual.email}`;
        let contas = this.getItem(chaveDados) || [];
        
        contas = contas.filter(conta => conta.id !== id);
        
        this.setItem(chaveDados, contas);
        return true;
    },
    
    // Adicionar nova conta
    adicionarConta: function(conta) {
        const usuarioAtual = this.getItem('usuarioAtual');
        if (!usuarioAtual) return false;
        
        const chaveDados = `contas_${usuarioAtual.email}`;
        const contas = this.getItem(chaveDados) || [];
        
        // Gerar ID único
        conta.id = Date.now().toString();
        
        // Gerar parcelas automaticamente se for parcelada
        if (conta.tipoPagamento === 'parcelado' && conta.numeroParcelas > 1) {
            const valorParcela = conta.valor / conta.numeroParcelas;
            const dataCompra = new Date(conta.dataCompra);
            
            conta.parcelas = [];
            
            for (let i = 1; i <= conta.numeroParcelas; i++) {
                // Calcular data de vencimento da parcela (mesmo dia dos meses seguintes)
                const dataVencimento = new Date(dataCompra);
                dataVencimento.setMonth(dataCompra.getMonth() + (i - 1));
                
                // Adicionar parcela
                conta.parcelas.push({
                    numero: i,
                    valor: valorParcela,
                    dataVencimento: dataVencimento.toISOString().split('T')[0],
                    status: i === 1 ? conta.status : 'pendente' // Primeira parcela herda o status da conta
                });
            }
        }
        
        contas.push(conta);
        this.setItem(chaveDados, contas);
        return true;
    },
    
    // Obter todas as contas do usuário atual
    getContas: function() {
        const usuarioAtual = this.getItem('usuarioAtual');
        if (!usuarioAtual) return [];
        
        const chaveDados = `contas_${usuarioAtual.email}`;
        return this.getItem(chaveDados) || [];
    },
    
    // Obter conta específica pelo ID
    getConta: function(id) {
        const contas = this.getContas();
        return contas.find(conta => conta.id === id);
    },
    
    // Excluir conta pelo ID
    deletarConta: function(id) {
        const usuarioAtual = this.getItem('usuarioAtual');
        if (!usuarioAtual) return false;
        
        const chaveDados = `contas_${usuarioAtual.email}`;
        let contas = this.getItem(chaveDados) || [];
        
        contas = contas.filter(conta => conta.id !== id);
        
        this.setItem(chaveDados, contas);
        return true;
    }
};
