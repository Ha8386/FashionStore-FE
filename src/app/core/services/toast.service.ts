import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.className = `toast align-items-center text-bg-${this.mapType(type)} border-0 show mb-2`;
    wrapper.role = 'alert';
    wrapper.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    container.appendChild(wrapper);

    // Auto remove sau 3 giây
    setTimeout(() => {
      wrapper.classList.remove('show');
      wrapper.classList.add('hide');
      setTimeout(() => wrapper.remove(), 500);
    }, 3000);
  }

  private mapType(type: string) {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      default: return 'primary';
    }
  }
}
