document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const cadastroForm = document.getElementById('cadastro-form');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const cadastroButton = document.getElementById('cadastro-button');
    const cadastroMessage = document.getElementById('cadastro-message');

    const nomeValidation = document.getElementById('nome-validation');
    const emailValidation = document.getElementById('email-validation');
    const passwordValidation = document.getElementById('password-validation');
    const confirmPasswordValidation = document.getElementById('confirm-password-validation');

    const strengthIndicator = document.getElementById('strength-indicator');
    const strengthText = document.getElementById('strength-text');

    const lengthCheck = document.getElementById('length-check');
    const uppercaseCheck = document.getElementById('uppercase-check');
    const numberCheck = document.getElementById('number-check');
    const specialCheck = document.getElementById('special-check');

    const togglePassword = document.getElementById('toggle-password');
    const toggleConfirmPassword = document.getElementById('toggle-confirm-password');

    // Validadores
    function validateNome() {
        const nome = nomeInput.value.trim();
        if (!nome) {
            nomeValidation.textContent = "Preencha seu nome completo";
            return false;
        } else if (nome.length < 3) {
            nomeValidation.textContent = "Nome muito curto";
            return false;
        } else if (!nome.includes(' ')) {
            nomeValidation.textContent = "Informe nome e sobrenome";
            return false;
        }
        nomeValidation.textContent = "";
        return true;
    }

    async function validateEmail() {
        const email = emailInput.value.trim();
        
        if (!email) {
            emailValidation.textContent = "Preencha seu e-mail";
            return false;
        } else if (!emailInput.validity.valid) {
            emailValidation.textContent = "E-mail inválido";
            return false;
        }
        
        // Verificar se o email já existe no Supabase
        try {
            const emailExists = await supabaseStorage.buscarUsuario(email);
            if (emailExists) {
                emailValidation.textContent = "Este e-mail já está cadastrado";
                return false;
            }
        } catch (error) {
            console.warn('Erro ao verificar email no Supabase, usando localStorage como fallback:', error);
            // Fallback para localStorage
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const emailExists = usuarios.some(u => u.email === email);

            if (emailExists) {
                emailValidation.textContent = "Este e-mail já está cadastrado";
                return false;
            }
        }

        emailValidation.textContent = "";
        return true;
    }

    function checkPasswordStrength(password) {
        let strength = 0;

        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        // UI
        updateRequirement(lengthCheck, hasLength);
        updateRequirement(uppercaseCheck, hasUppercase);
        updateRequirement(numberCheck, hasNumber);
        updateRequirement(specialCheck, hasSpecial);

        strength += hasLength ? 25 : 0;
        strength += hasUppercase ? 25 : 0;
        strength += hasNumber ? 25 : 0;
        strength += hasSpecial ? 25 : 0;

        strengthIndicator.style.width = `${strength}%`;

        let status = "Senha muito fraca";
        let color = 'var(--danger)';
        if (strength >= 75) {
            status = "Senha forte";
            color = 'var(--success)';
        } else if (strength >= 50) {
            status = "Senha média";
            color = 'var(--warning)';
        }

        strengthIndicator.style.backgroundColor = color;
        strengthText.textContent = status;
        strengthText.style.color = color;

        return strength >= 75;
    }

    function updateRequirement(element, isValid) {
        const icon = element.querySelector('i');
        icon.className = isValid ? 'fas fa-check-circle' : 'fas fa-times-circle';
        icon.style.color = isValid ? 'var(--success)' : 'var(--danger)';
    }

    function validatePassword() {
        const password = passwordInput.value;
        if (!password) {
            passwordValidation.textContent = "Preencha sua senha";
            return false;
        }

        const isStrong = checkPasswordStrength(password);
        if (!isStrong) {
            passwordValidation.textContent = "Senha não atende aos requisitos mínimos";
            return false;
        }

        passwordValidation.textContent = "";
        return true;
    }

    function validateConfirmPassword() {
        const confirmPassword = confirmPasswordInput.value;
        if (!confirmPassword) {
            confirmPasswordValidation.textContent = "Confirme sua senha";
            return false;
        } else if (confirmPassword !== passwordInput.value) {
            confirmPasswordValidation.textContent = "As senhas não coincidem";
            return false;
        }

        confirmPasswordValidation.textContent = "";
        return true;
    }

    async function checkFormValidity() {
        const valid = validateNome() && await validateEmail() && validatePassword() && validateConfirmPassword();
        cadastroButton.disabled = !valid;
    }

    // Eventos
    nomeInput.addEventListener('input', () => { validateNome(); checkFormValidity(); });
    emailInput.addEventListener('input', () => { validateEmail(); checkFormValidity(); });
    passwordInput.addEventListener('input', () => { validatePassword(); validateConfirmPassword(); checkFormValidity(); });
    confirmPasswordInput.addEventListener('input', () => { validateConfirmPassword(); checkFormValidity(); });

    togglePassword.addEventListener('click', () => {
        toggleVisibility(passwordInput, togglePassword);
    });

    toggleConfirmPassword.addEventListener('click', () => {
        toggleVisibility(confirmPasswordInput, toggleConfirmPassword);
    });

    function toggleVisibility(input, button) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        button.classList.toggle('fa-eye');
        button.classList.toggle('fa-eye-slash');
    }

    // Cadastro
    cadastroForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        // Validar todos os campos novamente
        if (!validateNome() || !await validateEmail() || !validatePassword() || !validateConfirmPassword()) {
            return;
        }

        // Desabilitar botão durante o processo
        cadastroButton.disabled = true;
        cadastroButton.textContent = 'Cadastrando...';

        try {
            const novoUsuario = {
                nome: nomeInput.value.trim(),
                email: emailInput.value.trim(),
                senha: passwordInput.value
            };

            // Salvar usuário no Supabase
            const usuarioSalvo = await supabaseStorage.salvarUsuario(novoUsuario);
            
            console.log('Novo usuário cadastrado:', usuarioSalvo);

            cadastroMessage.textContent = "Cadastro realizado com sucesso! Redirecionando para o login...";
            cadastroMessage.className = "alert alert-success";
            cadastroMessage.style.display = "block";

            cadastroForm.reset();
            
            setTimeout(() => window.location.href = "index.html", 3000);
            
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            
            cadastroMessage.textContent = "Erro ao realizar cadastro. Tente novamente.";
            cadastroMessage.className = "alert alert-danger";
            cadastroMessage.style.display = "block";
            
            // Reabilitar botão
            cadastroButton.disabled = false;
            cadastroButton.textContent = 'Cadastrar';
        }
    });
});
