import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslocoModule } from '@jsverse/transloco';
import { IRecipient } from '../../Models/models.interface';


@Component({
  selector: 'tc-recipients',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    TranslocoModule
  ],
  templateUrl: './recipients.component.html',
  styleUrl: './recipients.component.scss'
})
export class RecipientsComponent implements OnInit {
  recipients: IRecipient[] = [];
  
  constructor() { }
  
  ngOnInit(): void {
    // Would typically load recipients from a service
    this.loadMockRecipients();
  }
  
  loadMockRecipients(): void {
    // Add some mock recipients later
  }
}