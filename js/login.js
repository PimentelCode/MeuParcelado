document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const emailValidation = document.getElementById('email-validation');
    const passwordValidation = document.getElementById('password-validation');
    const togglePassword = document.getElementById('toggle-password');
    
    // Código para o botão de debug foi removido
  
    // Alternar visibilidade da senha
    togglePassword.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePassword.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
  
    function validateEmail() {
      if (!emailInput.value) {
        emailValidation.textContent = "Preencha seu e-mail";
        return false;
      } else if (!emailInput.validity.valid) {
        emailValidation.textContent = "E-mail inválido";
        return false;
      }
      emailValidation.textContent = "";
      return true;
    }
  
    function validatePassword() {
      if (!passwordInput.value) {
        passwordValidation.textContent = "Preencha sua senha";
        return false;
      } else if (passwordInput.value.length < 6) {
        passwordValidation.textContent = "Senha muito curta";
        return false;
      }
      passwordValidation.textContent = "";
      return true;
    }
  
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!validateEmail() || !validatePassword()) return;
  
      const email = emailInput.value;
      const senha = passwordInput.value;
      
      // Desabilitar botão durante o processo
      const loginButton = loginForm.querySelector('button[type="submit"]');
      const originalText = loginButton.textContent;
      loginButton.disabled = true;
      loginButton.textContent = 'Entrando...';
      
      try {
        // Buscar usuário no Supabase
        const usuario = await supabaseStorage.buscarUsuario(email);
        
        console.log('Tentativa de login com:', email);
        
        if (usuario && usuario.senha === senha) {
          // Salvar usuário atual no storage (mantém compatibilidade)
          supabaseStorage.setItem('usuarioAtual', usuario);
          
          document.querySelector('.login-container').style.opacity = '0';
          document.querySelector('.login-container').style.transform = 'translateY(-10px)';
          
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 300);
        } else {
          loginError.style.display = 'block';
          setTimeout(() => loginError.style.display = 'none', 5000);
        }
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        
        // Fallback para localStorage
        console.warn('Usando localStorage como fallback');
        const usuarios = storage.getItem('usuarios') || [];
        const usuario = usuarios.find(u => u.email === email && u.senha === senha);
        
        if (usuario) {
          storage.setItem('usuarioAtual', usuario);
          document.querySelector('.login-container').style.opacity = '0';
          document.querySelector('.login-container').style.transform = 'translateY(-10px)';
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 300);
        } else {
          loginError.style.display = 'block';
          setTimeout(() => loginError.style.display = 'none', 5000);
        }
      } finally {
        // Reabilitar botão
        loginButton.disabled = false;
        loginButton.textContent = originalText;
      }
    });
  
    // Animação inicial
    document.querySelector('.login-container').style.opacity = '0';
    document.querySelector('.login-container').style.transform = 'translateY(10px)';
    setTimeout(() => {
      const box = document.querySelector('.login-container');
      box.style.transition = 'all 0.5s ease';
      box.style.opacity = '1';
      box.style.transform = 'translateY(0)';
    }, 100);
  });
  