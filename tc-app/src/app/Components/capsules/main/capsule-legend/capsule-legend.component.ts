import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'tc-capsule-legend',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    TranslocoModule
  ],
  templateUrl: './capsule-legend.component.html',
  styleUrls: ['./capsule-legend.component.scss']
})
export class CapsuleLegendComponent {
  // We'll use a simpler structure that works better with translations
  statusSections = [
    {
      titleKey: 'capsule.legend.categories.visibility',
      items: [
        { icon: 'public', labelKey: 'capsule.status.public', color: 'primary' },
        { icon: 'lock', labelKey: 'capsule.status.private', color: 'warn' }
      ]
    },
    {
      titleKey: 'capsule.legend.categories.accessibility',
      items: [
        { icon: 'visibility', labelKey: 'capsule.status.opened', color: 'primary' },
        { icon: 'lock_open', labelKey: 'capsule.status.openable', color: 'accent' }
      ]
    },
    {
      titleKey: 'capsule.legend.categories.location',
      items: [
        { icon: 'cloud', labelKey: 'capsule.status.digital', color: 'primary' },
        { icon: 'place', labelKey: 'capsule.status.physical', color: 'accent' }
      ]
    },
    {
      titleKey: 'capsule.legend.categories.info',
      items: [
        { icon: 'event', labelKey: 'capsule.legend.created', color: '' },
        { icon: 'event_available', labelKey: 'capsule.legend.opens', color: '' },
        { icon: 'attach_file', labelKey: 'capsule.legend.items', color: '' },
        { icon: 'person', labelKey: 'capsule.legend.recipients', color: '' }
      ]
    }
  ];
}