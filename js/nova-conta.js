// Inicialização da página de nova conta
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const usuarioAtual = supabaseStorage.getItem('usuarioAtual') || JSON.parse(localStorage.getItem('usuarioAtual'));
    if (!usuarioAtual) {
        window.location.href = 'index.html';
        return;
    }

    // Configurar evento de logout
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        
        if (confirm('Tem certeza que deseja sair?')) {
            supabaseStorage.removeItem('usuarioAtual');
            localStorage.removeItem('usuarioAtual');
            window.location.href = 'index.html';
        }
    });

    // Definir data atual como padrão
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    document.getElementById('data-compra').value = dataFormatada;
    
    // Mostrar/ocultar opções de parcelas
    const tipoPagamentoSelect = document.getElementById('tipo-pagamento');
    const parcelasGroup = document.getElementById('parcelas-group');
    const numeroParcelasSelect = document.getElementById('numero-parcelas');
    const valorInput = document.getElementById('valor');
    const dataCompraInput = document.getElementById('data-compra');
    const parcelasPreview = document.getElementById('parcelas-preview');
    const listaParcelas = document.getElementById('lista-parcelas');
    const progressFill = document.getElementById('progress-fill');
    const totalParcelasSpan = document.getElementById('total-parcelas');
    const statusSelect = document.getElementById('status');
    
    tipoPagamentoSelect.addEventListener('change', function() {
        if (this.value === 'parcelado') {
            parcelasGroup.style.display = 'block';
            atualizarPreviewParcelas();
            parcelasPreview.style.display = 'block';
        } else {
            parcelasGroup.style.display = 'none';
            parcelasPreview.style.display = 'none';
        }
    });
    
    // Atualizar preview de parcelas quando os valores mudarem
    numeroParcelasSelect.addEventListener('change', atualizarPreviewParcelas);
    valorInput.addEventListener('input', atualizarPreviewParcelas);
    dataCompraInput.addEventListener('change', atualizarPreviewParcelas);
    statusSelect.addEventListener('change', atualizarPreviewParcelas);
    
    function atualizarPreviewParcelas() {
        if (tipoPagamentoSelect.value !== 'parcelado') return;
        
        const valor = parseFloat(valorInput.value);
        const numParcelas = parseInt(numeroParcelasSelect.value);
        const dataCompra = new Date(dataCompraInput.value);
        const status = statusSelect.value;
        
        if (isNaN(valor) || isNaN(numParcelas) || isNaN(dataCompra.getTime())) return;
        
        const valorParcela = valor / numParcelas;
        listaParcelas.innerHTML = '';
        
        for (let i = 0; i < numParcelas; i++) {
            const dataVencimento = new Date(dataCompra);
            dataVencimento.setMonth(dataVencimento.getMonth() + i);
            
            const parcelaStatus = i === 0 && status === 'pago' ? 'pago' : 'pendente';
            
            const parcelaItem = document.createElement('div');
            parcelaItem.className = `parcela-item ${parcelaStatus}`;
            
            parcelaItem.innerHTML = `
                <div class="parcela-info">
                    <span class="parcela-numero">${i + 1}/${numParcelas}</span>
                    <span class="parcela-data">${dataVencimento.toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="parcela-valor">R$ ${valorParcela.toFixed(2)}</div>
                <div class="parcela-status">${parcelaStatus}</div>
            `;
            
            listaParcelas.appendChild(parcelaItem);
        }
        
        // Atualizar barra de progresso
        const parcelasPagas = status === 'pago' ? 1 : 0;
        const porcentagemPago = (parcelasPagas / numParcelas) * 100;
        progressFill.style.width = `${porcentagemPago}%`;
        
        // Atualizar texto de total
        totalParcelasSpan.textContent = `${numParcelas} parcelas`;
    }
    
    // Verificar se é edição (URL contém id)
    const urlParams = new URLSearchParams(window.location.search);
    const contaId = urlParams.get('id');
    
    if (contaId) {
        // Buscar conta no localStorage
        const chaveDados = `contas_${usuarioAtual.email}`;
        const contas = JSON.parse(localStorage.getItem(chaveDados)) || [];
        const conta = contas.find(c => c.id === contaId);
        
        if (conta) {
            // Preencher formulário com dados da conta
            document.getElementById('nome').value = conta.nome;
            document.getElementById('categoria').value = conta.categoria || '';
            document.getElementById('valor').value = conta.valor;
            
            // Definir data de compra
            if (conta.dataCompra) {
                document.getElementById('data-compra').value = conta.dataCompra.split('T')[0];
            }
            
            // Definir tipo de pagamento
            if (conta.tipoPagamento) {
                tipoPagamentoSelect.value = conta.tipoPagamento;
            } else if (conta.parcelas && conta.parcelas.length > 1) {
                tipoPagamentoSelect.value = 'parcelado';
            } else {
                tipoPagamentoSelect.value = 'avista';
            }
            
            // Mostrar campo de parcelas se for parcelado
            if (tipoPagamentoSelect.value === 'parcelado') {
                parcelasGroup.style.display = 'block';
                
                // Definir número de parcelas
                if (conta.parcelas && conta.parcelas.length > 0) {
                    numeroParcelasSelect.value = conta.parcelas.length;
                }
                
                // Mostrar preview de parcelas
                parcelasPreview.style.display = 'block';
                atualizarPreviewParcelas();
            }
            
            // Definir status
            if (conta.status) {
                statusSelect.value = conta.status;
            }
            
            // Alterar o título da página para indicar edição
            document.querySelector('.page-header h2').textContent = 'Editar Conta';
        }
    }
    
    // Configurar evento de envio do formulário
    const formNovaConta = document.getElementById('nova-conta-form');
    formNovaConta.addEventListener('submit', function(e) {
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
        
        // Criar objeto da conta
        const novaConta = {
            id: contaId || Date.now().toString(), // Usar ID existente se estiver editando
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
            const dataCompra = new Date(dataCompraInput.value);
            // Coletar parcelas pagas
            const checkboxes = document.querySelectorAll('input[name="parcelas-pagas"]:checked');
            const pagasSelecionadas = Array.from(checkboxes).map(cb => parseInt(cb.value));
            for (let i = 0; i < numeroParcelas; i++) {
                const dataVencimento = new Date(dataCompra);
                dataVencimento.setMonth(dataCompra.getMonth() + i);
                let statusParcela = pagasSelecionadas.includes(i + 1) ? 'pago' : 'pendente';
                novaConta.parcelas.push({
                    numero: i + 1,
                    valor: valorParcela,
                    dataVencimento: dataVencimento.toISOString().split('T')[0],
                    status: statusParcela
                });
            }
        } else {
            // Para pagamento à vista, criar uma única "parcela"
            const dataVencimento = new Date(dataCompra);
            
            novaConta.parcelas.push({
                numero: 1,
                valor: valor,
                dataVencimento: dataVencimento.toISOString(),
                status: status
            });
        }
        
        // Obter usuário atual
        const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
        
        // Definir a chave correta para armazenar as contas do usuário
        const chaveDados = `contas_${usuarioAtual.email}`;
        
        // Buscar contas existentes do usuário
        let contas = JSON.parse(localStorage.getItem(chaveDados)) || [];
        
        if (contaId) {
            // Se estiver editando, encontrar e atualizar a conta existente
            const contaIndex = contas.findIndex(c => c.id === contaId);
            if (contaIndex !== -1) {
                contas[contaIndex] = novaConta;
            } else {
                contas.push(novaConta);
            }
        } else {
            // Se for nova conta, adicionar à lista
            contas.push(novaConta);
        }
        
        // Salvar no localStorage
        localStorage.setItem(chaveDados, JSON.stringify(contas));
        
        alert('Conta salva com sucesso!');
        window.location.href = 'contas.html';
    });
});


// Função para atualizar visualmente os checkboxes de parcelas pagas
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

// Atualizar checkboxes ao mudar número de parcelas ou tipo de pagamento
function atualizarParcelasPagasUI() {
  atualizarCheckboxParcelasPagas();
}
document.getElementById('tipo-pagamento').addEventListener('change', atualizarParcelasPagasUI);
document.getElementById('numero-parcelas').addEventListener('change', atualizarParcelasPagasUI);

// Ao editar, marcar as parcelas pagas corretas
const urlParams = new URLSearchParams(window.location.search);
const contaId = urlParams.get('id');
if (contaId) {
  const usuarioAtual = supabaseStorage.getItem('usuarioAtual') || JSON.parse(localStorage.getItem('usuarioAtual'));
  
  // Buscar conta específica no Supabase
  supabaseStorage.buscarConta(contaId, usuarioAtual.email)
    .then(conta => {
      if (conta && conta.tipoPagamento === 'parcelado' && conta.parcelas) {
        const pagas = conta.parcelas
          .map((p, idx) => p.status === 'pago' ? idx + 1 : null)
          .filter(x => x !== null);
        setTimeout(() => atualizarCheckboxParcelasPagas(pagas), 300);
      }
    })
    .catch(error => {
      console.warn('Erro ao buscar conta no Supabase, usando localStorage:', error);
      // Fallback para localStorage
      const chaveDados = `contas_${usuarioAtual.email}`;
      const contas = JSON.parse(localStorage.getItem(chaveDados)) || [];
      const conta = contas.find(c => c.id === contaId);
      if (conta && conta.tipoPagamento === 'parcelado' && conta.parcelas) {
        const pagas = conta.parcelas
          .map((p, idx) => p.status === 'pago' ? idx + 1 : null)
          .filter(x => x !== null);
        setTimeout(() => atualizarCheckboxParcelasPagas(pagas), 300);
      }
    });
}

// Ao salvar, coletar as parcelas pagas selecionadas
const formNovaConta = document.getElementById('nova-conta-form');
formNovaConta.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Obter dados do formulário
  const nome = document.getElementById('nome').value;
  const categoria = document.getElementById('categoria').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const dataCompra = document.getElementById('data-compra').value;
  const tipoPagamento = document.getElementById('tipo-pagamento').value;
  const status = document.getElementById('status').value;
  
  const novaConta = {
    id: contaId || Date.now().toString(), // Usar ID existente se estiver editando
    nome: nome,
    categoria: categoria,
    valor: valor,
    dataCompra: dataCompra,
    tipoPagamento: tipoPagamento,
    status: status,
    parcelas: []
  };
  
  if (tipoPagamento === 'parcelado') {
    const numeroParcelas = parseInt(document.getElementById('numero-parcelas').value);
    const valorParcela = valor / numeroParcelas;
    const dataCompra = new Date(dataCompraInput.value);
    // Coletar parcelas pagas
    const checkboxes = document.querySelectorAll('input[name="parcelas-pagas"]:checked');
    const pagasSelecionadas = Array.from(checkboxes).map(cb => parseInt(cb.value));
    for (let i = 0; i < numeroParcelas; i++) {
      const dataVencimento = new Date(dataCompra);
      dataVencimento.setMonth(dataCompra.getMonth() + i);
      let statusParcela = pagasSelecionadas.includes(i + 1) ? 'pago' : 'pendente';
      novaConta.parcelas.push({
        numero: i + 1,
        valor: valorParcela,
        dataVencimento: dataVencimento.toISOString().split('T')[0],
        status: statusParcela
      });
    }
  } else {
    // Para pagamento à vista, criar uma única "parcela"
    const dataVencimento = new Date(dataCompra);
    
    novaConta.parcelas.push({
      numero: 1,
      valor: valor,
      dataVencimento: dataVencimento.toISOString(),
      status: status
    });
  }
  
  // Obter usuário atual
  const usuarioAtual = supabaseStorage.getItem('usuarioAtual') || JSON.parse(localStorage.getItem('usuarioAtual'));
  
  // Desabilitar botão durante o salvamento
  const submitButton = formNovaConta.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Salvando...';
  
  try {
    // Salvar conta no Supabase
    const contaSalva = await supabaseStorage.salvarConta({
      ...novaConta,
      usuario_email: usuarioAtual.email
    });
    
    console.log('Conta salva com sucesso:', contaSalva);
    alert('Conta salva com sucesso!');
    window.location.href = 'contas.html';
    
  } catch (error) {
    console.error('Erro ao salvar conta no Supabase:', error);
    
    // Fallback para localStorage
    console.warn('Usando localStorage como fallback');
    
    const chaveDados = `contas_${usuarioAtual.email}`;
    let contas = JSON.parse(localStorage.getItem(chaveDados)) || [];
    
    if (contaId) {
      // Se estiver editando, encontrar e atualizar a conta existente
      const contaIndex = contas.findIndex(c => c.id === contaId);
      if (contaIndex !== -1) {
        contas[contaIndex] = novaConta;
      } else {
        contas.push(novaConta);
      }
    } else {
      // Se for nova conta, adicionar à lista
      contas.push(novaConta);
    }
    
    // Salvar no localStorage
    localStorage.setItem(chaveDados, JSON.stringify(contas));
    
    alert('Conta salva com sucesso!');
    window.location.href = 'contas.html';
    
  } finally {
    // Reabilitar botão
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});