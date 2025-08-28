import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  DOCUMENT,
  Inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { OauthService } from '../../../oauth/service/oauth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  isMobileMenuOpen = false;

  constructor(
    private router: Router,
    private authService: OauthService,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    // Smooth scroll behavior for page
    document.documentElement.style.scrollBehavior = 'smooth';

    // Force body to allow scrolling for landing page
    document.body.style.overflowY = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflowY = 'auto';
    document.documentElement.style.height = 'auto';

    // Add click listener to close mobile menu when clicking outside
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngAfterViewInit(): void {
    // Ensure DOM is ready for scroll operations
    console.log(
      'Landing page loaded, content height:',
      document.body.scrollHeight,
    );
    console.log('Viewport height:', window.innerHeight);
  }

  ngOnDestroy(): void {
    // Reset body styles when leaving landing page
    document.body.style.overflowY = '';
    document.body.style.height = '';
    document.documentElement.style.overflowY = '';
    document.documentElement.style.height = '';

    // Remove click listener
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  /**
   * Highlight and scroll to a specific section
   * @param sectionId - The ID of the section to scroll to
   */
  highlightSection(sectionId: string): void {
    console.log('Attempting to scroll to section:', sectionId);

    // Wait a bit to ensure DOM is ready
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      console.log('Found element:', element);

      if (element) {
        // Calculate position manually for better control
        const headerOffset = 80; // Account for fixed header
        const elementPosition = element.offsetTop;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });

        // Add a temporary highlight effect
        element.classList.add('section-highlight');
        setTimeout(() => {
          element.classList.remove('section-highlight');
        }, 2000);
      } else {
        console.warn('Element not found with ID:', sectionId);
      }
    }, 100);
  }

  /**
   * Navigate to login page
   */
  login(): void {
    this.authService.login();
  }

  /**
   * Navigate to signup page
   */
  onSignUp(): void {
    this.document.location.href =
      environment.stsBaseUrl + '/Account/Registration';
  }

  /**
   * Navigate to landlord signup specifically
   */
  onLordSignUp(): void {
    // Navigate to the app for now (implement actual signup later)
    this.router.navigate(['/app']);
  }

  /**
   * Navigate to main application
   */
  goToApp(): void {
    this.router.navigate(['/app']);
  }

  /**
   * Open external link
   * @param url - External URL to open
   */
  openExternalLink(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Send email
   * @param email - Email address
   */
  sendEmail(email: string): void {
    window.location.href = `mailto:${email}`;
  }

  /**
   * Open WhatsApp
   */
  openWhatsApp(): void {
    // Replace with your actual WhatsApp number
    const phoneNumber = '+1234567890';
    const message = "Hi! I'm interested in RentConnect.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  /**
   * Toggle mobile menu visibility
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  /**
   * Handle document click to close mobile menu
   */
  private onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const isMenuButton = target.closest('.menu-button');
    const isNavMenu = target.closest('.nav-menu-wrapper');

    if (!isMenuButton && !isNavMenu && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }
}
