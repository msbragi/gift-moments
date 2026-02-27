import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

/**
 * Defines the available toggle button types
 */
export type ViewToggleType = 'divider' | 
  'new' |
  'grid' |
  'list' |
  'help' |
  'upload' |
  'calendar' |
  'link' |
  'map' |
  'chart' |
  'details';

/**
 * Configuration interface for controlling button visibility
 */
export interface ViewToggleOptions {
  visible?: {
    divider?: boolean;
    new?: boolean;
    upload?: boolean;
    grid?: boolean;
    list?: boolean;
    help?: boolean;
    calendar?: boolean;
    link?: boolean;
    map?: boolean;
    chart?: boolean;
    details?: boolean;
  };
}

/**
 * A component that displays toggle buttons for switching between different view modes
 */
@Component({
  selector: 'tc-panel-view-toggle',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    TranslocoModule
  ],
  template: `
    <div class="view-toggle" *transloco="let t; read: 'common.tooltips'">
      @for (btn of visibleButtons; track btn.value) {
        @if (btn.value === 'divider') {
          <mat-divider vertical class="divider"></mat-divider>
        } @else {
          <button
            mat-icon-button
            [ngClass]="selected === btn.value ? 'active' : ''"
            [attr.aria-pressed]="selected === btn.value"
            (click)="onSelect(btn.value)"
            [matTooltip]="t(btn.tooltip)"
            type="button"
          >
            <mat-icon [color]="selected === btn.value ? 'accent' : undefined">{{ btn.icon }}</mat-icon>
          </button>
        }
      }
    </div>
  `,
  styles: [
    `.view-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        .mdc-icon-button {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            &.active {
                color: var(--mdc-theme-primary, #1976d2) !important;
            }
        }
        .divider {
            height: 24px;
            width: 1px;
            color: var(--mat-sys-on-background); 
        }
    }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelViewToggleComponent implements OnInit, OnChanges {
  /**
   * Options to control button visibility and initial value
   */
  @Input() options: ViewToggleOptions = {};

  /**
   * The currently selected value
   */
  @Input() value: ViewToggleType = 'grid';

  /**
   * Event emitted when the selected value changes
   */
  @Output() valueChange = new EventEmitter<ViewToggleType>();

  /**
   * Currently selected toggle value
   */
  selected: ViewToggleType = 'grid';

  /**
   * All available buttons with their configurations
   */
  private allButtons = [
    { value: 'new' as const, icon: 'add', tooltip: 'new', visible: false },
    { value: 'upload' as const, icon: 'upload', tooltip: 'upload', visible: false },
    { value: 'link' as const, icon: 'link', tooltip: 'link', visible: false },
    { value: 'divider' as const, icon: '', tooltip: '', visible: false },
    { value: 'grid' as const, icon: 'grid_view', tooltip: 'grid', visible: false },
    { value: 'list' as const, icon: 'view_list', tooltip: 'list', visible: false },
    { value: 'calendar' as const, icon: 'calendar_month', tooltip: 'calendar', visible: false },
    { value: 'map' as const, icon: 'map', tooltip: 'map', visible: false },
    { value: 'chart' as const, icon: 'bar_chart', tooltip: 'chart', visible: false },
    { value: 'details' as const, icon: 'article', tooltip: 'details', visible: false },
    { value: 'help' as const, icon: 'help_outline', tooltip: 'help', visible: false }
  ];

  /**
   * Returns only the visible buttons
   */
  get visibleButtons() {
    return this.allButtons.filter(btn => btn.visible);
  }

  /**
   * Initialize component with default settings
   */
  ngOnInit() {
    // Set initial selected value
    this.selected = this.value;
    this.applyOptions();
  }

  /**
   * Apply updated options when they change
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.applyOptions();
    }
    if (changes['value'] && !changes['value'].firstChange) {
      this.selected = this.value;
    }
  }

  /**
   * Apply the provided options to control button visibility
   */
  private applyOptions(): void {
    if (this.options?.visible) {
      for (const btn of this.allButtons) {
        const visibilitySetting = this.options.visible[btn.value as keyof typeof this.options.visible];
        if (visibilitySetting !== undefined) {
          btn.visible = visibilitySetting;
        }
      }
    }
  }

  /**
   * Handles button selection and emits only on state change
   * Ignores divider clicks as they are not selectable
   * @param val The selected value
   */
  onSelect(val: ViewToggleType) {
    // Dividers are not selectable
    if (val === 'divider') {
      return;
    }
    
    if (this.selected !== val) {
      this.selected = val;
      this.valueChange.emit(val);
    }
  }
}