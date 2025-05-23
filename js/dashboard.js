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
    let categorias = {};

    contas.forEach(conta => {
      if (conta.parcelas && Array.isArray(conta.parcelas)) {
        conta.parcelas.forEach(parcela => {
          const dataParcela = new Date(parcela.dataVencimento);
          const isMesAtual = dataParcela.getMonth() === mesAtual && dataParcela.getFullYear() === anoAtual;

          totalGeral += parcela.valor;

          // Agrupar por categoria
          const categoria = conta.categoria || 'Outros';
          if (!categorias[categoria]) {
            categorias[categoria] = 0;
          }
          categorias[categoria] += parcela.valor;

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

    // Criar gráficos
    criarGraficoStatus(pagas, pendentes);
    criarGraficoCategorias(categorias);
  }
  
  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  // Variáveis para armazenar instâncias dos gráficos
  let statusChart = null;
  let categoryChart = null;

  function criarGraficoStatus(pagas, pendentes) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (statusChart) {
      statusChart.destroy();
    }

    statusChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Pagas', 'Pendentes'],
        datasets: [{
          data: [pagas, pendentes],
          backgroundColor: [
            '#2ecc71', // Verde para pagas
            '#e74c3c'  // Vermelho para pendentes
          ],
          borderColor: [
            '#27ae60',
            '#c0392b'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#fff',
              font: {
                size: 14
              },
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  function criarGraficoCategorias(categorias) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (categoryChart) {
      categoryChart.destroy();
    }

    const labels = Object.keys(categorias);
    const data = Object.values(categorias);
    
    // Cores para as barras
    const colors = [
      '#00b894', '#0984e3', '#6c5ce7', '#a29bfe',
      '#fd79a8', '#fdcb6e', '#e17055', '#81ecec',
      '#fab1a0', '#00cec9', '#55a3ff', '#ff7675'
    ];

    categoryChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Valor Gasto (R$)',
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color + '80'),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${formatarMoeda(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#fff',
              callback: function(value) {
                return formatarMoeda(value);
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#fff',
              maxRotation: 45
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  }
  