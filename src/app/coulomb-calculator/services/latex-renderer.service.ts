import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class LatexRendererService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  render(element: HTMLElement, latex: string): void {
    if (!this.isBrowser) return;
    import('katex').then(({ default: katex }) => {
      katex.render(latex, element, { throwOnError: false, displayMode: true });
    });
  }
}
