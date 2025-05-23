// Mobile Menu Functionality
class MobileMenu {
  constructor() {
    this.hamburgerMenu = document.getElementById('hamburger-menu');
    this.mainNav = document.getElementById('main-nav');
    this.mobileOverlay = document.getElementById('mobile-overlay');
    this.isOpen = false;
    this.isLoggedIn = false;
    
    this.init();
    this.setupAuthNavigation();
  }
  
  init() {
    if (this.hamburgerMenu && this.mainNav && this.mobileOverlay) {
      this.hamburgerMenu.addEventListener('click', () => this.toggleMenu());
      this.mobileOverlay.addEventListener('click', () => this.closeMenu());
      
      // Close menu when clicking on navigation links
      const navLinks = this.mainNav.querySelectorAll('a');
      navLinks.forEach(link => {
        if (link.id === 'logout-btn') {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
          });
        } else {
          link.addEventListener('click', () => this.closeMenu());
        }
      });
      
      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMenu();
        }
      });
      
      // Handle window resize
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && this.isOpen) {
          this.closeMenu();
        }
      });
    }
  }
  
  toggleMenu() {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }
  
  openMenu() {
    this.isOpen = true;
    this.hamburgerMenu.classList.add('active');
    this.mainNav.classList.add('active');
    this.mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management for accessibility
    this.hamburgerMenu.setAttribute('aria-expanded', 'true');
  }
  
  closeMenu() {
    this.isOpen = false;
    this.hamburgerMenu.classList.remove('active');
    this.mainNav.classList.remove('active');
    this.mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Focus management for accessibility
    this.hamburgerMenu.setAttribute('aria-expanded', 'false');
  }
}

  setupAuthNavigation() {
    const usuarioAtual = localStorage.getItem('usuarioAtual');
    this.isLoggedIn = !!usuarioAtual;
    
    const navHtml = this.isLoggedIn ? `
      <ul>
        <li><a href="/dashboard/"><i class="fas fa-tachometer-alt"></i> <span class="nav-text">Dashboard</span></a></li>
        <li><a href="/contas/"><i class="fas fa-credit-card"></i> <span class="nav-text">Contas</span></a></li>
        <li><a href="/relatorio/"><i class="fas fa-chart-bar"></i> <span class="nav-text">Relatórios</span></a></li>
        <li><a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> <span class="nav-text">Sair</span></a></li>
      </ul>
    ` : `
      <ul>
        <li><a href="/inicio.html"><i class="fas fa-home"></i> <span class="nav-text">Início</span></a></li>
        <li><a href="/login.html"><i class="fas fa-sign-in-alt"></i> <span class="nav-text">Login</span></a></li>
        <li><a href="/cadastro.html"><i class="fas fa-user-plus"></i> <span class="nav-text">Cadastro</span></a></li>
      </ul>
    `;
    
    if (this.mainNav) {
      this.mainNav.innerHTML = navHtml;
      this.init(); // Reinitialize event listeners for new navigation items
    }
  }

  handleLogout() {
    localStorage.removeItem('usuarioAtual');
    window.location.href = '/inicio.html';
  }
}

// Initialize mobile menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenu = new MobileMenu();
  
  // Update navigation when storage changes (e.g., login/logout in another tab)
  window.addEventListener('storage', (e) => {
    if (e.key === 'usuarioAtual') {
      mobileMenu.setupAuthNavigation();
    }
  });
});