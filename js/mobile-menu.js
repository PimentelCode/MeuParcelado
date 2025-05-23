// Mobile Menu Functionality
class MobileMenu {
  constructor() {
    this.hamburgerMenu = document.getElementById('hamburger-menu');
    this.mainNav = document.getElementById('main-nav');
    this.mobileOverlay = document.getElementById('mobile-overlay');
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    if (this.hamburgerMenu && this.mainNav && this.mobileOverlay) {
      this.hamburgerMenu.addEventListener('click', () => this.toggleMenu());
      this.mobileOverlay.addEventListener('click', () => this.closeMenu());
      
      // Close menu when clicking on navigation links
      const navLinks = this.mainNav.querySelectorAll('a');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (link.id !== 'logout-btn') {
            this.closeMenu();
          }
        });
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

// Initialize mobile menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MobileMenu();
});