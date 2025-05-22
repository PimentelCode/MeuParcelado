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
  
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateEmail() || !validatePassword()) return;
  
      const email = emailInput.value;
      const senha = passwordInput.value;
  
      // Usar a biblioteca storage para obter os usuários
      const usuarios = storage.getItem('usuarios') || [];
      const usuario = usuarios.find(u => u.email === email && u.senha === senha);
      
      // Para debug - verificar se os usuários estão sendo encontrados
      console.log('Usuários cadastrados:', usuarios);
      console.log('Tentativa de login com:', email);
  
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
  