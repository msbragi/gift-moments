import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapsuleRecipientsComponent } from './capsule-recipients.component';

describe('CapsuleRecipientsComponent', () => {
  let component: CapsuleRecipientsComponent;
  let fixture: ComponentFixture<CapsuleRecipientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapsuleRecipientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapsuleRecipientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
