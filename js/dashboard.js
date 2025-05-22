document.addEventListener('DOMContentLoaded', function () {
    // Verificar autenticação
    const usuarioAtual = storage.getItem('usuarioAtual');
    if (!usuarioAtual) {
      window.location.href = 'index.html';
      return;
    }
  
    // Carregar dados da dashboard
    carregarDadosDashboard(usuarioAtual.email);
  
    // Logout
    document.getElementById('logout-btn').addEventListener('click', function (e) {
      e.preventDefault();
      storage.removeItem('usuarioAtual');
      alert("Logout realizado com sucesso!");
      window.location.href = 'index.html';
    });
  });
  
  function carregarDadosDashboard(email) {
    const contas = storage.getContas() || [];
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();
  
    let totalGeral = 0;
    let totalMes = 0;
    let pagas = 0;
    let pendentes = 0;
  
    contas.forEach(conta => {
      if (conta.parcelas && Array.isArray(conta.parcelas)) {
        conta.parcelas.forEach(parcela => {
          const dataParcela = new Date(parcela.dataVencimento);
          const isMesAtual = dataParcela.getMonth() === mesAtual && dataParcela.getFullYear() === anoAtual;
  
          totalGeral += parcela.valor;
  
          if (isMesAtual) {
            totalMes += parcela.valor;
            if (parcela.status === 'pago') {
              pagas++;
            } else {
              pendentes++;
            }
          }
        });
      }
    });
  
    // Atualizar a UI
    document.getElementById('total-geral').textContent = formatarMoeda(totalGeral);
    document.getElementById('total-mes').textContent = formatarMoeda(totalMes);
    document.getElementById('contas-pagas').textContent = pagas;
    document.getElementById('contas-pendentes').textContent = pendentes;
  }
  
  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
  