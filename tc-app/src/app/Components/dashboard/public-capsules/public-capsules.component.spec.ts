import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicCapsulesComponent } from './public-capsules.component';

describe('PublicCapsulesComponent', () => {
  let component: PublicCapsulesComponent;
  let fixture: ComponentFixture<PublicCapsulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicCapsulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicCapsulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
