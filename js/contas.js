// Inicialização da página de contas
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const usuarioAtual = storage.getItem('usuarioAtual');
    if (!usuarioAtual) {
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar contas do usuário
    carregarContas();
    
    // Calcular e exibir o total do mês atual
    atualizarTotalMesAtual();

    // Preencher opções dos filtros
    preencherOpcoesFiltros();
    
    // Configurar eventos
    document.getElementById('filter').addEventListener('change', carregarContas);
    document.getElementById('month-filter').addEventListener('change', function() {
        carregarContas();
        atualizarTotalMesAtual();
    });
    document.getElementById('search-btn').addEventListener('click', buscarContas);
    document.getElementById('search').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            buscarContas();
        }
    });

    // Configurar evento de logout
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        storage.removeItem('usuarioAtual');
        window.location.href = 'index.html';
    });
});

// Função para carregar as contas do usuário
function carregarContas() {
    // Buscar contas do usuário
    const contas = storage.getContas();
    const filtro = document.getElementById('filter').value;
    const mesFiltro = document.getElementById('month-filter').value;
    const termoBusca = document.getElementById('search').value.toLowerCase();
    
    let contasFiltradas = contas;
    
    // Aplicar filtro de status
    if (filtro === 'mes-atual') {
        contasFiltradas = filtrarContasMesAtual(contas);
    } else if (filtro === 'pendentes') {
        contasFiltradas = contas.filter(conta => !todasParcelasPagas(conta));
    } else if (filtro === 'pagas') {
        contasFiltradas = contas.filter(conta => todasParcelasPagas(conta));
    }
    
    // Aplicar filtro de mês
    if (mesFiltro !== 'todos') {
        const mesNumero = parseInt(mesFiltro);
        contasFiltradas = contasFiltradas.filter(conta => {
            const dataVencimento = new Date(conta.dataVencimento || conta.dataCompra);
            return dataVencimento.getMonth() === mesNumero;
        });
    }
    
    // Aplicar busca
    if (termoBusca) {
        contasFiltradas = contasFiltradas.filter(conta => 
            conta.nome.toLowerCase().includes(termoBusca)
        );
    }
    
    exibirContas(contasFiltradas);
    
    // Atualizar o total do mês atual
    atualizarTotalMesAtual();
}

// Função para filtrar contas do mês atual
function filtrarContasMesAtual(contas) {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();
    
    return contas.filter(conta => {
        // Para contas sem parcelas, verificar a data de vencimento
        if (!conta.parcelas || conta.parcelas.length === 0) {
            const dataVencimento = new Date(conta.dataVencimento || conta.dataCompra);
            return dataVencimento.getMonth() === mesAtual && 
                   dataVencimento.getFullYear() === anoAtual;
        }
        
        // Para contas com parcelas, verificar se alguma parcela vence no mês atual
        return conta.parcelas.some(parcela => {
            const dataParcela = new Date(parcela.dataVencimento);
            return dataParcela.getMonth() === mesAtual && 
                   dataParcela.getFullYear() === anoAtual;
        });
    });
}

// Função para verificar se todas as parcelas estão pagas
function todasParcelasPagas(conta) {
    // Se a conta já tem status 'pago', retornar true
    if (conta.status === 'pago') return true;
    
    // Se a conta não tem parcelas, verificar o status diretamente
    if (!conta.parcelas || conta.parcelas.length === 0) {
        return false;
    }
    
    // Verificar se todas as parcelas estão pagas
    return conta.parcelas.every(parcela => parcela.status === 'pago');
}

// Função para preencher opções dos filtros
function preencherOpcoesFiltros() {
    // Preencher filtro de status
    const filterSelect = document.getElementById('filter');
    
    // Limpar opções existentes
    filterSelect.innerHTML = '';
    
    // Adicionar opções de filtro
    const filtros = [
        { value: 'todos', text: 'Todas as contas' },
        { value: 'mes-atual', text: 'Mês atual' },
        { value: 'pendentes', text: 'Pendentes' },
        { value: 'pagas', text: 'Pagas' }
    ];
    
    filtros.forEach(filtro => {
        const option = document.createElement('option');
        option.value = filtro.value;
        option.textContent = filtro.text;
        filterSelect.appendChild(option);
    });
    
    // Preencher meses
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthFilter = document.getElementById('month-filter');
    
    // Limpar opções existentes
    monthFilter.innerHTML = '';
    
    // Adicionar opção 'Todos'
    const todosOption = document.createElement('option');
    todosOption.value = 'todos';
    todosOption.textContent = 'Todos os meses';
    monthFilter.appendChild(todosOption);
    
    // Adicionar meses
    meses.forEach((mes, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = mes;
        monthFilter.appendChild(option);
    });
}

// Função para buscar contas
function buscarContas() {
    carregarContas();
}

// Função para exibir as contas na tabela
function exibirContas(contas) {
    // Obter referência ao corpo da tabela
    const tbody = document.getElementById('accounts-body');
    tbody.innerHTML = '';
    
    // Verificar se existem contas
    if (contas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="mensagem-vazia">Nenhuma conta cadastrada.</td>';
        tbody.appendChild(tr);
        return;
    }
    
    // Exibir cada conta na tabela
    contas.forEach(conta => {
        const tr = document.createElement('tr');
        
        // Determinar o tipo da conta
        let tipoConta = '';
        if (conta.tipoPagamento === 'parcelado') {
            tipoConta = 'parcelada';
        } else if (conta.tipoPagamento === 'fixa') {
            tipoConta = 'fixa';
        } else {
            tipoConta = 'única';
        }
        
        // Determinar o status da conta
        let statusConta = conta.status || 'pendente';
        
        // Determinar a data de vencimento
        let dataVencimento;
        if (conta.dataVencimento) {
            dataVencimento = formatarData(conta.dataVencimento);
        } else if (conta.parcelas && conta.parcelas.length > 0) {
            dataVencimento = formatarData(conta.parcelas[0].dataVencimento);
        } else {
            dataVencimento = formatarData(conta.dataCompra);
        }
        
        // Criar a linha da tabela
        tr.innerHTML = `
            <td>${conta.nome}</td>
            <td>${tipoConta}</td>
            <td>${formatarMoeda(conta.valor)}</td>
            <td>${dataVencimento}</td>
            <td><span class="status-tag ${statusConta}">${statusConta}</span></td>
            <td class="acoes">
                <button class="btn btn-small ${statusConta === 'pago' ? 'btn-disabled' : 'btn-success'}" 
                        onclick="marcarComoPaga('${conta.id}')" 
                        ${statusConta === 'pago' ? 'disabled' : ''}>
                    <i class="fas fa-check"></i> Pagar
                </button>
                <button class="btn btn-small btn-primary" onclick="editarConta('${conta.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-small btn-danger" onclick="excluirConta('${conta.id}')">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Função para marcar uma conta como paga
function marcarComoPaga(contaId) {
    // Obter usuário logado
    const usuarioAtual = storage.getItem('usuarioAtual');
    if (!usuarioAtual) return;
    
    // Buscar contas do usuário
    const chaveDados = `contas_${usuarioAtual.email}`;
    let contas = JSON.parse(localStorage.getItem(chaveDados)) || [];
    
    // Encontrar a conta pelo ID
    const contaIndex = contas.findIndex(c => c.id == contaId);
    if (contaIndex === -1) {
        alert("Erro: Conta não encontrada!");
        return;
    }
    
    // Atualizar status da conta
    contas[contaIndex].status = 'pago';
    contas[contaIndex].dataPagamento = new Date().toISOString();
    
    // Salvar alterações no localStorage
    localStorage.setItem(chaveDados, JSON.stringify(contas));
    
    // Recarregar a tabela
    carregarContas();
    
    // Atualizar o total do mês atual
    atualizarTotalMesAtual();
    
    alert("Conta marcada como paga com sucesso!");
}

// Função para excluir uma conta
function excluirConta(contaId) {
    // Confirmar exclusão
    if (!confirm('Tem certeza que deseja excluir esta conta?')) {
        return;
    }
    
    // Obter usuário logado
    const usuarioAtual = storage.getItem('usuarioAtual');
    if (!usuarioAtual) return;
    
    // Buscar contas do usuário
    const chaveDados = `contas_${usuarioAtual.email}`;
    let contas = JSON.parse(localStorage.getItem(chaveDados)) || [];
    
    // Filtrar a conta a ser excluída
    const contasAntigas = contas.length;
    contas = contas.filter(c => c.id != contaId);
    
    if (contas.length === contasAntigas) {
        alert("Erro: Conta não encontrada!");
        return;
    }
    
    // Salvar alterações no localStorage
    localStorage.setItem(chaveDados, JSON.stringify(contas));
    
    // Recarregar a tabela
    carregarContas();
    
    // Atualizar o total do mês atual
    atualizarTotalMesAtual();
    
    alert("Conta excluída com sucesso!");
}

/**
 * Função auxiliar para formatar valores monetários
 */
function formatarMoeda(valor) {
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
}

/**
 * Função para calcular e exibir o total a pagar no mês atual
 */
function atualizarTotalMesAtual() {
    // Obter todas as contas
    const contas = storage.getContas();
    
    // Filtrar contas do mês atual e pendentes
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();
    
    const contasMesAtual = contas.filter(conta => {
        // Verificar se a conta está pendente
        if (conta.status === 'pago') return false;
        
        // Verificar se a conta vence no mês atual
        const dataVencimento = new Date(conta.dataVencimento || conta.dataCompra);
        return dataVencimento.getMonth() === mesAtual && 
               dataVencimento.getFullYear() === anoAtual;
    });
    
    // Calcular o total
    const total = contasMesAtual.reduce((soma, conta) => soma + parseFloat(conta.valor || 0), 0);
    
    // Exibir o total na interface
    document.getElementById('valor-mes-atual').textContent = formatarMoeda(total);
}

/**
 * Função auxiliar para formatar datas
 */
function formatarData(dataString) {
    if (!dataString || dataString === 'undefined') {
        // Retornar a data atual em vez de uma data padrão fixa
        return new Date().toLocaleDateString('pt-BR');
    }
    
    try {
        // Tentar converter a string para data
        const data = new Date(dataString);
        
        // Verificar se a data é válida
        if (isNaN(data.getTime())) {
            // Tentar outro formato se a data for inválida
            if (typeof dataString === 'string' && dataString.includes('-')) {
                // Formato ISO YYYY-MM-DD
                const partes = dataString.split('T')[0].split('-');
                if (partes.length === 3) {
                    return `${partes[2]}/${partes[1]}/${partes[0]}`;
                }
            }
            // Se não conseguir formatar, retornar a data atual
            return new Date().toLocaleDateString('pt-BR');
        }
        
        // Formatar a data no padrão brasileiro
        return data.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'});
    } catch (e) {
        console.error('Erro ao formatar data:', e, dataString);
        // Em caso de erro, retornar a data atual
        return new Date().toLocaleDateString('pt-BR');
    }
}

// Função para renderizar a tabela de contas
function renderizarTabela(contas) {
    const tbody = document.getElementById('accounts-body');
    tbody.innerHTML = '';
    
    if (contas.length === 0) {
        // Exibir mensagem se não houver contas
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" class="text-center">Nenhuma conta encontrada</td>`;
        tbody.appendChild(tr);
        return;
    }
    
    contas.forEach(conta => {
        const tr = document.createElement('tr');
        
        // Formatar a data de vencimento
        let dataFormatada = formatarData(conta);
        
        // Determinar o status da conta
        let statusClass = conta.status === 'pago' ? 'pago' : 'pendente';
        let statusText = conta.status === 'pago' ? 'Pago' : 'Pendente';
        
        // Criar HTML da linha
        tr.innerHTML = `
            <td>${conta.nome}</td>
            <td>${conta.tipoPagamento === 'parcelado' ? '<i class="fas fa-credit-card"></i> Parcelada' : 
                 (conta.tipoPagamento === 'fixa' ? '<i class="fas fa-calendar-check"></i> Fixa' : 
                 '<i class="fas fa-money-bill"></i> À Vista')}</td>
            <td>R$ ${conta.valor.toFixed(2)}</td>
            <td>${dataFormatada}</td>
            <td>
                <span class="status-tag ${statusClass}">${statusText}</span>
            </td>
            <td class="acoes">
                ${conta.status === 'pago' ? '' : 
                `<button class="btn btn-sm btn-success" onclick="marcarComoPaga('${conta.id}')">
                    <i class="fas fa-check"></i> Pagar
                </button>`}
                <button class="btn btn-sm btn-primary" onclick="editarConta('${conta.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="excluirConta('${conta.id}')">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Função para formatar a data corretamente
function formatarData(conta) {
    try {
        // Tentar obter a data de diferentes fontes
        let data;
        
        if (conta.dataVencimento) {
            data = new Date(conta.dataVencimento);
        } else if (conta.parcelas && conta.parcelas.length > 0) {
            data = new Date(conta.parcelas[0].dataVencimento);
        } else if (conta.dataCompra) {
            data = new Date(conta.dataCompra);
        }
        
        // Verificar se a data é válida
        if (data && !isNaN(data.getTime())) {
            return data.toLocaleDateString('pt-BR');
        }
        
        // Se chegou aqui, tentar extrair a data de uma string ISO
        if (typeof conta.dataCompra === 'string') {
            // Remover a parte de tempo se existir
            const dataLimpa = conta.dataCompra.split('T')[0];
            const partes = dataLimpa.split('-');
            
            if (partes.length === 3) {
                // Formato ISO YYYY-MM-DD
                return `${partes[2]}/${partes[1]}/${partes[0]}`;
            }
        }
        
        return "Data não disponível";
    } catch (e) {
        console.error("Erro ao formatar data:", e);
        return "Data não disponível";
    }
}