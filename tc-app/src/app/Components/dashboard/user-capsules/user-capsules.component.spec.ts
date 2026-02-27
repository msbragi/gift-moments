import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCapsulesComponent } from './user-capsules.component';

describe('UserCapsulesComponent', () => {
  let component: UserCapsulesComponent;
  let fixture: ComponentFixture<UserCapsulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCapsulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCapsulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
