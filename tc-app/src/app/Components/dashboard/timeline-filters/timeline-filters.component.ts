import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@jsverse/transloco';
import { TimelineFilter } from '../../../Models/timeline.model';

interface FilterOption {
  value: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'tc-timeline-filters',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './timeline-filters.component.html',
  styleUrl: './timeline-filters.component.scss'
})
export class TimelineFiltersComponent {
  @Input() filter: TimelineFilter = TimelineFilter.createDefault();
  @Output() filterChange = new EventEmitter<TimelineFilter>();
  @Output() clearFilters = new EventEmitter<void>();

  // Filter options
  timeRangeOptions: FilterOption[] = [
    { value: 'all', label: 'All Time' },
    { value: 'year', label: 'This Year' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' }
  ];

  eventTypeOptions: FilterOption[] = [
    { value: 'created', label: 'Created', icon: 'add_circle' },
    { value: 'opened', label: 'Opened', icon: 'lock_open' },
    { value: 'scheduled', label: 'Scheduled', icon: 'schedule' }
  ];

  visibilityOptions: FilterOption[] = [
    { value: 'all', label: 'All Capsules' },
    { value: 'public', label: 'Public Only' },
    { value: 'user-related', label: 'My Involvement' }
  ];

  contentTypeOptions: FilterOption[] = [
    { value: 'image', label: 'Images', icon: 'image' },
    { value: 'video', label: 'Videos', icon: 'videocam' },
    { value: 'audio', label: 'Audio', icon: 'audiotrack' },
    { value: 'text', label: 'Text', icon: 'text_fields' },
    { value: 'documents', label: 'Documents', icon: 'description' }
  ];

  onTimeRangeChange(): void {
    this.filterChange.emit(this.filter);
  }

  onVisibilityChange(): void {
    this.filterChange.emit(this.filter);
  }

  toggleEventType(eventType: string): void {
    const index = this.filter.eventTypes.indexOf(eventType as any);
    if (index > -1) {
      this.filter.eventTypes.splice(index, 1);
    } else {
      this.filter.eventTypes.push(eventType as any);
    }
    this.filterChange.emit(this.filter);
  }

  toggleContentType(contentType: string): void {
    const index = this.filter.contentTypes.indexOf(contentType);
    if (index > -1) {
      this.filter.contentTypes.splice(index, 1);
    } else {
      this.filter.contentTypes.push(contentType);
    }
    this.filterChange.emit(this.filter);
  }

  isEventTypeSelected(eventType: string): boolean {
    return this.filter.eventTypes.includes(eventType as any);
  }

  isContentTypeSelected(contentType: string): boolean {
    return this.filter.contentTypes.includes(contentType);
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }
}
