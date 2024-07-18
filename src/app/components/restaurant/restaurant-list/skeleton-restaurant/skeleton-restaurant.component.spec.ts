import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonRestaurantComponent } from './skeleton-restaurant.component';

describe('SkeletonRestaurantComponent', () => {
  let component: SkeletonRestaurantComponent;
  let fixture: ComponentFixture<SkeletonRestaurantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkeletonRestaurantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkeletonRestaurantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
