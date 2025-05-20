document.addEventListener('DOMContentLoaded', function() {
    // Verificar se é modo de edição (URL contém id)
    const urlParams = new URLSearchParams(window.location.search);
    const contaId = urlParams.get('id');
    
    if (contaId) {
        // Buscar usuário atual
        const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
        if (!usuarioAtual) {
            window.location.href = 'index.html';
            return;
        }
        
        // Buscar conta no localStorage
        const chaveDados = `contas_${usuarioAtual.email}`;
        const contas = JSON.parse(localStorage.getItem(chaveDados)) || [];
        const conta = contas.find(c => c.id == contaId);
        
        if (conta) {
            // Alterar o título da página para indicar edição
            document.querySelector('.page-header h2').textContent = 'Editar Conta';
            
            // Preencher formulário com dados da conta
            document.getElementById('nome').value = conta.nome;
            document.getElementById('categoria').value = conta.categoria || '';
            document.getElementById('valor').value = conta.valor;
            
            // Definir data de compra
            if (conta.dataCompra) {
                document.getElementById('data-compra').value = conta.dataCompra.split('T')[0];
            }
            
            // Definir tipo de pagamento
            const tipoPagamentoSelect = document.getElementById('tipo-pagamento');
            if (conta.tipoPagamento) {
                tipoPagamentoSelect.value = conta.tipoPagamento;
            } else if (conta.parcelas && conta.parcelas.length > 1) {
                tipoPagamentoSelect.value = 'parcelado';
            } else {
                tipoPagamentoSelect.value = 'avista';
            }
            
            // Mostrar campo de parcelas se for parcelado
            const parcelasGroup = document.getElementById('parcelas-group');
            if (tipoPagamentoSelect.value === 'parcelado') {
                parcelasGroup.style.display = 'block';
                
                // Definir número de parcelas
                if (conta.parcelas && conta.parcelas.length > 0) {
                    document.getElementById('numero-parcelas').value = conta.parcelas.length;
                }
            }
            
            // Definir status
            if (conta.status) {
                document.getElementById('status').value = conta.status;
            }
            
            // Adicionar ID da conta como campo oculto
            const idInput = document.createElement('input');
            idInput.type = 'hidden';
            idInput.id = 'conta-id';
            idInput.value = contaId;
            document.getElementById('nova-conta-form').appendChild(idInput);
            
            // Atualizar preview de parcelas
            if (typeof atualizarPreviewParcelas === 'function') {
                atualizarPreviewParcelas();
            }
            
            // Modificar o comportamento do formulário para atualizar em vez de criar
            const form = document.getElementById('nova-conta-form');
            const originalSubmitHandler = form.onsubmit;
            
            form.onsubmit = function(e) {
                e.preventDefault();
                
                // Obter dados do formulário
                const nome = document.getElementById('nome').value;
                const categoria = document.getElementById('categoria').value;
                const valor = parseFloat(document.getElementById('valor').value);
                const dataCompra = document.getElementById('data-compra').value;
                const tipoPagamento = document.getElementById('tipo-pagamento').value;
                const status = document.getElementById('status').value;
                
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
                
                // Adicionar parcelas se for parcelado
                if (tipoPagamento === 'parcelado') {
                    const numeroParcelas = parseInt(document.getElementById('numero-parcelas').value);
                    const valorParcela = valor / numeroParcelas;
                    
                    for (let i = 0; i < numeroParcelas; i++) {
                        // Calcular data de vencimento (mesmo dia dos meses seguintes)
                        const dataVencimento = new Date(dataCompra);
                        dataVencimento.setMonth(dataVencimento.getMonth() + i);
                        
                        // Determinar status da parcela
                        let statusParcela = 'pendente';
                        if (i === 0 && status === 'pago') {
                            statusParcela = 'pago';
                        }
                        
                        // Adicionar parcela
                        contaAtualizada.parcelas.push({
                            numero: i + 1,
                            valor: valorParcela,
                            dataVencimento: dataVencimento.toISOString(),
                            status: statusParcela
                        });
                    }
                    
                    // Definir data de vencimento como a data da última parcela
                    contaAtualizada.dataVencimento = contaAtualizada.parcelas[contaAtualizada.parcelas.length - 1].dataVencimento;
                } else {
                    // Para pagamento à vista, criar uma única "parcela"
                    const dataVencimento = new Date(dataCompra);
                    
                    contaAtualizada.parcelas.push({
                        numero: 1,
                        valor: valor,
                        dataVencimento: dataVencimento.toISOString(),
                        status: status
                    });
                    
                    // Definir data de vencimento
                    contaAtualizada.dataVencimento = dataVencimento.toISOString();
                }
                
                // Buscar contas do usuário
                const contas = JSON.parse(localStorage.getItem(chaveDados)) || [];
                
                // Encontrar índice da conta a ser atualizada
                const contaIndex = contas.findIndex(c => c.id == contaId);
                
                if (contaIndex !== -1) {
                    // Atualizar conta existente
                    contas[contaIndex] = contaAtualizada;
                    
                    // Salvar no localStorage
                    localStorage.setItem(chaveDados, JSON.stringify(contas));
                    
                    alert('Conta atualizada com sucesso!');
                    window.location.href = 'contas.html';
                } else {
                    alert('Erro: Conta não encontrada!');
                }
            };
        } else {
            alert('Erro: Conta não encontrada!');
            window.location.href = 'contas.html';
        }
    }
});