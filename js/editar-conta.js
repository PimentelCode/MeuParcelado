document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    let usuarioAtual;
    try {
        usuarioAtual = await supabaseStorage.obterUsuarioAtual();
        if (!usuarioAtual) {
            // Fallback para localStorage
            usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
    }
    
    if (!usuarioAtual) {
        window.location.href = 'index.html';
        return;
    }

    // Configurar evento de logout
    document.getElementById('logout-btn').addEventListener('click', async function(e) {
        e.preventDefault();
        
        if (confirm('Tem certeza que deseja sair?')) {
            try {
                await supabaseStorage.logout();
            } catch (error) {
                console.error('Erro no logout do Supabase:', error);
                localStorage.removeItem('usuarioAtual');
            }
            window.location.href = 'index.html';
        }
    });

    // Obter o ID da conta a ser editada salvo no localStorage
    const contaId = JSON.parse(localStorage.getItem('contaEditandoId'));
    if (!contaId) {
        alert('Conta não selecionada para edição.');
        window.location.href = 'contas.html';
        return;
    }

    // Buscar a conta correta
    let contas = [];
    try {
        contas = await supabaseStorage.obterContas(usuarioAtual.email);
    } catch (error) {
        console.error('Erro ao buscar contas do Supabase:', error);
        // Fallback para localStorage
        const chaveDados = `contas_${usuarioAtual.email}`;
        contas = JSON.parse(localStorage.getItem(chaveDados)) || [];
    }
    
    const conta = contas.find(c => c.id == contaId);
    if (!conta) {
        alert('Conta não encontrada!');
        window.location.href = 'contas.html';
        return;
    }

    // Configurar exibição de parcelas
    const tipoPagamentoSelect = document.getElementById('tipo-pagamento');
    const parcelasGroup = document.getElementById('parcelas-group');
    const numeroParcelasSelect = document.getElementById('numero-parcelas');

    // Criar div para parcelas pagas se não existir
    let parcelasPagasDiv = document.getElementById('parcelas-pagas-div');
    if (!parcelasPagasDiv) {
        parcelasPagasDiv = document.createElement('div');
        parcelasPagasDiv.id = 'parcelas-pagas-div';
        parcelasPagasDiv.style.marginTop = '15px';
        document.getElementById('parcelas-group').after(parcelasPagasDiv);
    }

    // Mostrar/ocultar opções de parcelas
    tipoPagamentoSelect.addEventListener('change', function() {
        if (this.value === 'parcelado') {
            parcelasGroup.style.display = 'block';
            atualizarCheckboxParcelasPagas(getParcelasPagas(conta));
        } else {
            parcelasGroup.style.display = 'none';
            parcelasPagasDiv.style.display = 'none';
        }
    });

    // Atualizar parcelas pagas quando o número de parcelas mudar
    numeroParcelasSelect.addEventListener('change', function() {
        if (tipoPagamentoSelect.value === 'parcelado') {
            atualizarCheckboxParcelasPagas(getParcelasPagas(conta));
        }
    });

    // Função para obter parcelas pagas da conta
    function getParcelasPagas(conta) {
        if (!conta.parcelas) return [];
        return conta.parcelas
            .filter(p => p.status === 'pago')
            .map(p => p.numero);
    }

    // Função para atualizar checkboxes de parcelas pagas
    function atualizarCheckboxParcelasPagas(parcelasPagas = []) {
        const tipoPagamento = document.getElementById('tipo-pagamento').value;
        const parcelasPagasDiv = document.getElementById('parcelas-pagas-div');
        const numParcelas = parseInt(document.getElementById('numero-parcelas').value) || 2;
        
        if (tipoPagamento === 'parcelado') {
            let html = '<label style="margin-top:10px;color:#fff;font-weight:600;">Parcelas já pagas:</label><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:5px;">';
            for (let i = 1; i <= numParcelas; i++) {
                const checked = parcelasPagas.includes(i) ? 'checked' : '';
                html += `<label style='color:#fff;'><input type='checkbox' name='parcelas-pagas' value='${i}' style='margin-right:4px;' ${checked}>${i}ª</label>`;
            }
            html += '</div>';
            parcelasPagasDiv.innerHTML = html;
            parcelasPagasDiv.style.display = 'block';
        } else {
            parcelasPagasDiv.innerHTML = '';
            parcelasPagasDiv.style.display = 'none';
        }
    }

    // Preencher os campos do formulário
    document.getElementById('nome').value = conta.nome || '';
    document.getElementById('categoria').value = conta.categoria || '';
    document.getElementById('valor').value = conta.valor || '';
    if (conta.dataCompra) {
        document.getElementById('data-compra').value = conta.dataCompra.split('T')[0];
    }
    if (conta.tipoPagamento) {
        document.getElementById('tipo-pagamento').value = conta.tipoPagamento;
    }
    if (conta.status) {
        document.getElementById('status').value = conta.status;
    }
    if (conta.tipoPagamento === 'parcelado' && conta.parcelas && conta.parcelas.length > 0) {
        document.getElementById('numero-parcelas').value = conta.parcelas.length;
        parcelasGroup.style.display = 'block';
        atualizarCheckboxParcelasPagas(getParcelasPagas(conta));
    }

    // Configurar evento de envio do formulário
    const formEditarConta = document.getElementById('editar-conta-form');
    formEditarConta.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obter valores do formulário
        const nome = document.getElementById('nome').value;
        const categoria = document.getElementById('categoria').value;
        const valor = parseFloat(document.getElementById('valor').value);
        const dataCompra = document.getElementById('data-compra').value;
        const tipoPagamento = document.getElementById('tipo-pagamento').value;
        const status = document.getElementById('status').value;
        
        // Validar campos obrigatórios
        if (!nome || !categoria || isNaN(valor) || !dataCompra || !tipoPagamento || !status) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Criar objeto da conta atualizada
        const contaAtualizada = {
            id: contaId,
            nome: nome,
            categoria: categoria,
            valor: valor,
            dataCompra: dataCompra,
            tipoPagamento: tipoPagamento,
            status: status,
            parcelas: []
        };
        
        // Adicionar informações de parcelas se for parcelado
        if (tipoPagamento === 'parcelado') {
            const numeroParcelas = parseInt(document.getElementById('numero-parcelas').value);
            const valorParcela = valor / numeroParcelas;
            const dataCompraObj = new Date(dataCompra);
            
            // Coletar parcelas pagas
            const checkboxes = document.querySelectorAll('input[name="parcelas-pagas"]:checked');
            const parcelasPagas = Array.from(checkboxes).map(cb => parseInt(cb.value));
            
            for (let i = 0; i < numeroParcelas; i++) {
                const dataVencimento = new Date(dataCompraObj);
                dataVencimento.setMonth(dataCompraObj.getMonth() + i);
                
                const statusParcela = parcelasPagas.includes(i + 1) ? 'pago' : 'pendente';
                
                contaAtualizada.parcelas.push({
                    numero: i + 1,
                    valor: valorParcela,
                    dataVencimento: dataVencimento.toISOString().split('T')[0],
                    status: statusParcela
                });
            }
        }
        
        // Atualizar conta
        try {
supabaseStorage.atualizarConta(contaAtualizada).then(() => {
    alert('Conta atualizada com sucesso!');
    window.location.href = 'contas.html';
}).catch((error) => {
    console.error('Erro ao atualizar conta no Supabase:', error);
    throw error; // Re-throw to trigger catch block
});
            alert('Conta atualizada com sucesso!');
            window.location.href = 'contas.html';
        } catch (error) {
            console.error('Erro ao atualizar conta no Supabase:', error);
            // Fallback para localStorage
            try {
                const chaveDados = `contas_${usuarioAtual.email}`;
                const contasLocal = JSON.parse(localStorage.getItem(chaveDados)) || [];
                const indice = contasLocal.findIndex(c => c.id == contaId);
                if (indice !== -1) {
                    contasLocal[indice] = contaAtualizada;
                    localStorage.setItem(chaveDados, JSON.stringify(contasLocal));
                    alert('Conta atualizada com sucesso!');
                    window.location.href = 'contas.html';
                } else {
                    alert('Erro ao atualizar conta. Tente novamente.');
                }
            } catch (localError) {
                console.error('Erro no fallback localStorage:', localError);
                alert('Erro ao atualizar conta. Tente novamente.');
            }
        }
    });
});