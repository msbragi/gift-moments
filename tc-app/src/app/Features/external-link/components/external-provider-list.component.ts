import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { IExternalProvider } from '../../../Models/external-providers.interface';

/**
 * Component for displaying supported external providers
 * Shows a list of available providers with their capabilities
 */
@Component({
  selector: 'tc-external-provider-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    TranslocoModule
  ],
  template: `
    <div *transloco="let t; read: 'external-link'">
      <div class="supported-providers" *ngIf="!readonly && providers.length > 0">
        <h3>{{ t('supported-providers') }}</h3>
        <div class="providers-list">
          <div 
            *ngFor="let provider of providers"
            class="provider-icon"
            [style.background-image]="'url(' + provider.icon + ')'"
            [matTooltip]="getProviderTooltip(provider, t)"
            matTooltipPosition="below">
          </div>
      </div>
    </div>
  `,
  styles: [`
    .supported-providers {
      margin-bottom: 16px;
      
      h3 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 500;
      }
      
      .providers-list {
        display: flex;
        gap: 8px;
        padding: 10px;

        .provider-icon {
          width: 24px;
          height: 24px;
          cursor: pointer;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          transition: filter 0.2s ease;

          @media (prefers-color-scheme: dark) {
            filter: invert(1) brightness(0.8);
          }
          
          &:hover {
            filter: brightness(0.5) contrast(0.8);
            @media (prefers-color-scheme: dark) {
              filter: invert(1) brightness(0.5) contrast(0.8);
            }
          }
        }
      }
    }
  `]
})
export class ExternalProviderListComponent {
  /**
   * List of supported external providers to display
   */
  @Input() providers: IExternalProvider[] = [];

  /**
   * Currently active/selected provider
   */
  @Input() currentProvider?: IExternalProvider;

  /**
   * Whether the component is in readonly mode (hides the list)
   */
  @Input() readonly = false;

  /**
   * Generate informative tooltip for provider
   */
  getProviderTooltip(provider: IExternalProvider, t: any): string {
    const capabilities = [];

    if (provider.embedSupport) {
      capabilities.push(t('supports-embed'));
    }

    if (provider.supportsMetadata) {
      capabilities.push(t('supports-metadata'));
    }

    const capabilityText = capabilities.length > 0
      ? `\n${capabilities.join(', ')}`
      : '';

    return `${provider.name}${capabilityText}`;
  }
}
