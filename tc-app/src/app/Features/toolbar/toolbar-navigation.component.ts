import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Navigation component for the toolbar - handles menu toggle and logo display
 */
@Component({
  selector: 'tc-toolbar-navigation',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-icon-button (click)="onToggleSidenav()" aria-label="Toggle navigation menu">
      <mat-icon>menu</mat-icon>
    </button>
    <div class="logo-container">
      <img src="./assets/img/logo-ok.png" alt="Your gift at perfect time" class="responsive-logo">
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      margin-left: 16px;
    }

    .responsive-logo {
      height: 32px;
      width: auto;
      
      @media (max-width: 768px) {
        height: 28px;
      }
      
      @media (max-width: 480px) {
        height: 24px;
      }
    }
  `]
})
export class ToolbarNavigationComponent {
  /** Event emitter for toggling the sidenav */
  @Output() toggleSidenav = new EventEmitter<void>();

  /**
   * Emits the toggle sidenav event
   */
  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }
}
