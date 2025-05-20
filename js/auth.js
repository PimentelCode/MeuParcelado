// Funções para autenticação de usuários

// Verifica se o usuário está logado
function verificarAutenticacao() {
    const usuarioAtual = storage.getItem('usuarioAtual');
    
    // Se não estiver na página de login ou cadastro e não estiver autenticado, redireciona para login
    const paginasPublicas = ['index.html', 'cadastro.html'];
    const paginaAtual = window.location.pathname.split('/').pop();
    
    if (!paginasPublicas.includes(paginaAtual) && !usuarioAtual) {
        window.location.href = 'index.html';
        return false;
    }
    
    // Se estiver na página de login ou cadastro e já estiver autenticado, redireciona para dashboard
    if (paginasPublicas.includes(paginaAtual) && usuarioAtual) {
        window.location.href = 'dashboard.html';
        return true;
    }
    
    return !!usuarioAtual;
}

// Inicializa a página com base na autenticação
function inicializarPagina() {
    verificarAutenticacao();
    
    // Configura o botão de logout em todas as páginas que o possuem
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', fazerLogout);
    }
    
    // Configura o formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', fazerLogin);
    }
    
    // Configura o formulário de cadastro
    const cadastroForm = document.getElementById('cadastro-form');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', cadastrarUsuario);
    }
    
    // Exibe o nome do usuário nas páginas que o mostram
    const usuarioAtual = storage.getItem('usuarioAtual');
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && usuarioAtual) {
        userNameElement.textContent = usuarioAtual.nome;
    }
}

// Função para fazer login
function fazerLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;
    
    const usuarios = storage.getItem('usuarios') || [];
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (usuario) {
        // Armazena o usuário atual sem a senha
        const usuarioLogado = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };
        
        storage.setItem('usuarioAtual', usuarioLogado);
        window.location.href = 'dashboard.html';
    } else {
        alert('E-mail ou senha incorretos!');
    }
}

// Função para cadastrar novo usuário
function cadastrarUsuario(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;
    const confirmarSenha = document.getElementById('confirm-password').value;
    
    // Validações básicas
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }
    
    const usuarios = storage.getItem('usuarios') || [];
    
    // Verifica se o e-mail já está cadastrado
    if (usuarios.some(u => u.email === email)) {
        alert('Este e-mail já está cadastrado!');
        return;
    }
    
    // Cria novo usuário
    const novoUsuario = {
        id: Date.now().toString(),
        nome,
        email,
        senha,
        dataCadastro: new Date().toISOString()
    };
    
    // Adiciona à lista de usuários
    usuarios.push(novoUsuario);
    storage.setItem('usuarios', usuarios);
    
    // Faz login automático
    const usuarioLogado = {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email
    };
    
    storage.setItem('usuarioAtual', usuarioLogado);
    
    alert('Cadastro realizado com sucesso!');
    window.location.href = 'dashboard.html';
}

// Função para fazer logout
function fazerLogout(event) {
    if (event) event.preventDefault();
    
    storage.removeItem('usuarioAtual');
    window.location.href = 'index.html';
}

// Inicializa a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarPagina);


// Função para login
function realizarLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    
    // Validar campos
    if (!email || !senha) {
        alert("Erro: Preencha todos os campos!");
        return;
    }
    
    // Buscar usuário
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (usuario) {
        // Salvar usuário logado
        storage.setItem('usuarioAtual', usuario);
        alert("Login realizado com sucesso!");
        window.location.href = 'dashboard.html';
    } else {
        alert("Erro: Email ou senha incorretos!");
    }
}

// Função para cadastro
function realizarCadastro(e) {
    e.preventDefault();
    
    const nome = document.getElementById('cadastro-nome').value;
    const email = document.getElementById('cadastro-email').value;
    const senha = document.getElementById('cadastro-senha').value;
    const confirmarSenha = document.getElementById('cadastro-confirmar-senha').value;
    
    // Validar campos
    if (!nome || !email || !senha || !confirmarSenha) {
        alert("Erro: Preencha todos os campos!");
        return;
    }
    
    if (senha !== confirmarSenha) {
        alert("Erro: As senhas não coincidem!");
        return;
    }
    
    // Verificar se email já existe
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.some(u => u.email === email)) {
        alert("Erro: Este email já está cadastrado!");
        return;
    }
    
    // Adicionar novo usuário
    const novoUsuario = { nome, email, senha };
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    alert("Cadastro realizado com sucesso! Faça login para continuar.");
    
    // Limpar campos e voltar para login
    document.getElementById('cadastro-form').reset();
    document.getElementById('login-tab').click();
}