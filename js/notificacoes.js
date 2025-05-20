// Verificar suporte a notificações
function verificarPermissaoNotificacao() {
    if (!("Notification" in window)) {
        console.log("Este navegador não suporta notificações");
        return false;
    }
    
    if (Notification.permission === "granted") {
        return true;
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            return permission === "granted";
        });
    }
    
    return false;
}

// Enviar notificação
function enviarNotificacao(titulo, mensagem, icone = 'img/logo.png') {
    if (!verificarPermissaoNotificacao()) return;
    
    const options = {
        body: mensagem,
        icon: icone
    };
    
    const notification = new Notification(titulo, options);
    
    notification.onclick = function() {
        window.focus();
        this.close();
    };
}

// Verificar contas próximas do vencimento
function verificarContasProximasVencimento() {
    const contas = JSON.parse(localStorage.getItem('contas')) || [];
    const hoje = new Date();
    
    // Verificar contas que vencem em até 3 dias
    contas.forEach(conta => {
        if (conta.status === 'pendente') {
            if (conta.tipoPagamento === 'parcelado' && conta.parcelas) {
                // Verificar próxima parcela pendente
                const proximaParcela = conta.parcelas.find(p => p.status !== 'pago');
                
                if (proximaParcela) {
                    const dataVencimento = new Date(proximaParcela.dataVencimento);
                    const diferencaDias = Math.floor((dataVencimento - hoje) / (1000 * 60 * 60 * 24));
                    
                    if (diferencaDias >= 0 && diferencaDias <= 3) {
                        enviarNotificacao(
                            "Conta próxima do vencimento",
                            `${conta.nome}: Parcela ${proximaParcela.numero}/${conta.numeroParcelas} vence em ${diferencaDias} dias.`
                        );
                    }
                }
            } else {
                // Verificar conta à vista
                const dataVencimento = new Date(conta.dataCompra);
                const diferencaDias = Math.floor((dataVencimento - hoje) / (1000 * 60 * 60 * 24));
                
                if (diferencaDias >= 0 && diferencaDias <= 3) {
                    enviarNotificacao(
                        "Conta próxima do vencimento",
                        `${conta.nome} vence em ${diferencaDias} dias.`
                    );
                }
            }
        }
    });
}

// Verificar contas ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    verificarPermissaoNotificacao();
    verificarContasProximasVencimento();
    
    // Verificar periodicamente (a cada 12 horas)
    setInterval(verificarContasProximasVencimento, 12 * 60 * 60 * 1000);
});