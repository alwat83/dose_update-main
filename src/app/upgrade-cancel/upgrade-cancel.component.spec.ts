import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradeCancelComponent } from './upgrade-cancel.component';

describe('UpgradeCancelComponent', () => {
  let component: UpgradeCancelComponent;
  let fixture: ComponentFixture<UpgradeCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpgradeCancelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpgradeCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
