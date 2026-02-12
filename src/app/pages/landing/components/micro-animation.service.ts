import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MicroAnimationService {
  private observer: IntersectionObserver | null = null;

  initTitleAnimations() {
    // Respeta prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            this.observer?.unobserve(entry.target); // Una sola vez
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger antes de ser completamente visible
      }
    );

    // Solo animar títulos y headers específicos
    const elements = document.querySelectorAll('.fade-in-up, .fade-in-up-fast');
    elements.forEach(el => this.observer?.observe(el));
  }

  destroy() {
    this.observer?.disconnect();
  }
}