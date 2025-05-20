// Verificar se o usuário está logado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const usuarioAtual = storage.getItem('usuarioAtual');
    if (!usuarioAtual) {
        window.location.href = 'index.html';
        return;
    }

    // Exibir nome do usuário
    document.getElementById('nome-usuario').textContent = usuarioAtual.nome;

    // Carregar e exibir dados das contas
    carregarDadosDashboard(usuarioAtual.email);

    // Configurar evento de logout
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        storage.removeItem('usuarioAtual');
        alert("Logout realizado com sucesso!");
        window.location.href = 'index.html';
    });
});

function carregarDadosDashboard(email) {
    // Buscar contas do usuário
    const contas = storage.getContas() || [];
    
    // Filtrar contas do mês atual
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();
    
    const contasMesAtual = contas.filter(conta => {
        const dataVencimento = new Date(conta.dataCompra);
        
        // Verificar se alguma parcela vence no mês atual
        return conta.parcelas.some(parcela => {
            const dataParcela = new Date(parcela.dataVencimento);
            return dataParcela.getMonth() === mesAtual && 
                   dataParcela.getFullYear() === anoAtual;
        });
    });

    // Obter parcelas do mês atual
    const parcelasMesAtual = [];
    contasMesAtual.forEach(conta => {
        conta.parcelas.forEach(parcela => {
            const dataParcela = new Date(parcela.dataVencimento);
            if (dataParcela.getMonth() === mesAtual && dataParcela.getFullYear() === anoAtual) {
                parcelasMesAtual.push({
                    ...parcela,
                    nomeConta: conta.nome,
                    categoria: conta.categoria
                });
            }
        });
    });

    // Calcular estatísticas
    const totalContas = contasMesAtual.length;
    const valorTotal = parcelasMesAtual.reduce((total, parcela) => total + parcela.valor, 0);
    const valorPago = parcelasMesAtual
        .filter(parcela => parcela.status === 'pago')
        .reduce((total, parcela) => total + parcela.valor, 0);
    
    const progresso = valorTotal > 0 ? Math.round((valorPago / valorTotal) * 100) : 0;

    // Atualizar elementos na tela
    document.getElementById('total-contas').textContent = totalContas;
    document.getElementById('valor-pagar').textContent = formatarMoeda(valorTotal);
    document.getElementById('valor-pago').textContent = formatarMoeda(valorPago);
    document.getElementById('porcentagem-pago').textContent = progresso;
    
    // Atualizar barra de progresso
    const barraProgresso = document.getElementById('barra-progresso');
    barraProgresso.style.width = `${progresso}%`;
    
    // Definir cor da barra baseada no progresso
    if (progresso < 30) {
        barraProgresso.style.backgroundColor = '#e74c3c'; // Vermelho
    } else if (progresso < 70) {
        barraProgresso.style.backgroundColor = '#f39c12'; // Amarelo
    } else {
        barraProgresso.style.backgroundColor = '#2ecc71'; // Verde
    }

    // Exibir próximas contas a vencer
    exibirProximasContas(parcelasMesAtual);
}

function exibirProximasContas(parcelas) {
    const containerProximasContas = document.getElementById('lista-proximas-contas');
    containerProximasContas.innerHTML = '';

    if (parcelas.length === 0) {
        containerProximasContas.innerHTML = '<p class="mensagem-vazia">Nenhuma conta cadastrada para este mês.</p>';
        return;
    }

    // Ordenar parcelas por data de vencimento
    const parcelasOrdenadas = [...parcelas].sort((a, b) => {
        return new Date(a.dataVencimento) - new Date(b.dataVencimento);
    });

    // Pegar as próximas 5 parcelas a vencer (ou todas se forem menos de 5)
    const proximasParcelas = parcelasOrdenadas
        .filter(parcela => parcela.status !== 'pago')
        .slice(0, 5);

    if (proximasParcelas.length === 0) {
        containerProximasContas.innerHTML = '<p class="mensagem-vazia">Todas as contas deste mês já foram pagas!</p>';
        return;
    }

    // Criar lista de próximas contas
    const listaContas = document.createElement('ul');
    listaContas.className = 'lista-contas';

    proximasParcelas.forEach(parcela => {
        const itemConta = document.createElement('li');
        itemConta.className = 'item-conta';
        
        const dataFormatada = formatarData(parcela.dataVencimento);
        
        itemConta.innerHTML = `
            <div class="conta-info">
                <h4>${parcela.nomeConta}</h4>
                <p>Parcela ${parcela.numero} - Vencimento: ${dataFormatada}</p>
            </div>
            <div class="conta-valor">
                <p>${formatarMoeda(parcela.valor)}</p>
                <span class="categoria-tag ${parcela.categoria}">${parcela.categoria}</span>
            </div>
        `;
        
        listaContas.appendChild(itemConta);
    });

    containerProximasContas.appendChild(listaContas);
}

function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}