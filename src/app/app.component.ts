import { Component, OnInit, HostListener, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'pediatric-occupational-therapist';
  
  // Navigation state
  navOpen = false;
  activeSection = 'home';
  windowWidth = 0;
  
  // Scroll and navigation control
  private canScroll = true;
  private scrollController: any = null;
  private sections = ['home', 'works', 'about', 'contact', 'hire'];
  
  // Work slider state
  currentSliderIndex = 0;
  workItems = [
    { 
      image: 'assets/img/work-victory.jpg', 
      title: 'Developmental Assessment', 
      description: 'Comprehensive evaluations to identify your child\'s strengths and areas for growth in development and daily living skills.' 
    },
    { 
      image: 'assets/img/work-metiew-smith.jpg', 
      title: 'Sensory Integration Therapy', 
      description: 'Specialized treatment to help children process sensory information and improve their ability to participate in daily activities.' 
    },
    { 
      image: 'assets/img/work-alex-nowak.jpg', 
      title: 'Mental Health Support', 
      description: 'Compassionate mental health services to support emotional regulation, coping strategies, and overall well-being.' 
    }
  ];
  
  // Touch gesture support
  private touchStartY = 0;
  private touchEndY = 0;
  
  // Form state
  formData = {
    name: '',
    email: '',
    services: [] as string[]
  };

  @ViewChild('viewport', { static: false }) viewport!: ElementRef;

  ngOnInit() {
    this.windowWidth = window.innerWidth;
  }

  ngAfterViewInit() {
    this.setupTouchGestures();
  }

  ngOnDestroy() {
    if (this.scrollController) {
      clearTimeout(this.scrollController);
    }
  }

  // Window resize handler
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.windowWidth = event.target.innerWidth;
    if (this.windowWidth >= 1024) {
      this.navOpen = false;
    }
  }

  // Mouse wheel navigation
  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    if (!this.navOpen && this.canScroll) {
      event.preventDefault();
      
      const delta = event.deltaY;
      
      if (delta > 50) {
        this.canScroll = false;
        clearTimeout(this.scrollController);
        this.scrollController = setTimeout(() => {
          this.canScroll = true;
        }, 800);
        this.updateHelper(1);
      } else if (delta < -50) {
        this.canScroll = false;
        clearTimeout(this.scrollController);
        this.scrollController = setTimeout(() => {
          this.canScroll = true;
        }, 800);
        this.updateHelper(-1);
      }
    }
  }

  // Keyboard navigation
  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (!this.navOpen) {
      event.preventDefault();
      
      if (event.keyCode === 40) { // Arrow down
        this.updateHelper(1);
      } else if (event.keyCode === 38) { // Arrow up
        this.updateHelper(-1);
      }
    }
  }

  // Touch gesture setup
  private setupTouchGestures() {
    if (this.viewport) {
      const element = this.viewport.nativeElement;
      
      element.addEventListener('touchstart', (e: TouchEvent) => {
        this.touchStartY = e.touches[0].clientY;
      }, { passive: true });
      
      element.addEventListener('touchend', (e: TouchEvent) => {
        this.touchEndY = e.changedTouches[0].clientY;
        this.handleTouchGesture();
      }, { passive: true });
    }
  }

  private handleTouchGesture() {
    const deltaY = this.touchStartY - this.touchEndY;
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) {
        // Swipe up - next section
        this.updateHelper(1);
      } else {
        // Swipe down - previous section
        this.updateHelper(-1);
      }
    }
  }

  // Navigation helper
  private updateHelper(direction: number) {
    const currentIndex = this.sections.indexOf(this.activeSection);
    const lastIndex = this.sections.length - 1;
    let nextIndex = 0;

    if (direction > 0) {
      // Moving forward
      if (currentIndex !== lastIndex) {
        nextIndex = currentIndex + 1;
      } else {
        nextIndex = 0; // Loop to first
      }
    } else {
      // Moving backward
      if (currentIndex !== 0) {
        nextIndex = currentIndex - 1;
      } else {
        nextIndex = lastIndex; // Loop to last
      }
    }

    this.setActiveSection(this.sections[nextIndex]);
  }

  // Navigation methods
  toggleNav() {
    this.navOpen = !this.navOpen;
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    this.navOpen = false; // Close nav on mobile when section is selected
  }

  // CTA button click - go to hire section
  onCtaClick() {
    this.setActiveSection('hire');
  }

  // Work slider methods
  nextSlide() {
    this.currentSliderIndex = (this.currentSliderIndex + 1) % this.workItems.length;
  }

  prevSlide() {
    this.currentSliderIndex = this.currentSliderIndex === 0 
      ? this.workItems.length - 1 
      : this.currentSliderIndex - 1;
  }

  getSliderItems() {
    const items = [];
    const total = this.workItems.length;
    
    for (let i = 0; i < 3; i++) {
      const index = (this.currentSliderIndex + i) % total;
      items.push({
        ...this.workItems[index],
        position: i === 0 ? 'left' : i === 1 ? 'center' : 'right'
      });
    }
    
    return items;
  }

  // Form methods
  onServiceChange(event: Event, service: string) {
    const checkbox = event.target as HTMLInputElement;
    
    if (checkbox.checked) {
      if (!this.formData.services.includes(service)) {
        this.formData.services.push(service);
      }
    } else {
      const index = this.formData.services.indexOf(service);
      if (index > -1) {
        this.formData.services.splice(index, 1);
      }
    }
  }

  onSubmit() {
    console.log('Form submitted:', this.formData);
    
    // Validate form
    if (!this.formData.name || !this.formData.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (this.formData.services.length === 0) {
      alert('Please select at least one therapy service');
      return;
    }
    
    // Here you would typically send the data to a server
    alert('Thank you for requesting a home visit! I will contact you within 24 hours to schedule a convenient time for your child\'s assessment.');
    
    // Reset form
    this.formData = {
      name: '',
      email: '',
      services: []
    };
  }

  // Form input focus handlers for label animation
  onInputFocus(event: Event) {
    const input = event.target as HTMLInputElement;
    input.classList.add('has-focus');
  }

  onInputBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    input.classList.remove('has-focus');
    
    if (input.value === '') {
      input.classList.remove('has-value');
    } else {
      input.classList.add('has-value');
    }
    
    // Correct mobile device window position (equivalent to jQuery's window.scrollTo(0, 0))
    if (this.windowWidth < 768) {
      window.scrollTo(0, 0);
    }
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    
    if (input.value !== '') {
      input.classList.add('has-value');
    } else {
      input.classList.remove('has-value');
    }
  }

  // Utility methods
  getCurrentSectionIndex(): number {
    return this.sections.indexOf(this.activeSection);
  }

  isFirstSection(): boolean {
    return this.activeSection === this.sections[0];
  }

  isLastSection(): boolean {
    return this.activeSection === this.sections[this.sections.length - 1];
  }

  // Check if CTA should be active (not on first or last section)
  isCtaActive(): boolean {
    const currentIndex = this.getCurrentSectionIndex();
    return currentIndex !== 0 && currentIndex !== this.sections.length - 1;
  }
}
