import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import katex from 'katex';

@Injectable({ providedIn: 'root' })
export class LatexRendererService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  render(element: HTMLElement, latex: string): void {
    if (!this.isBrowser) return;
    katex.render(latex, element, { throwOnError: false, displayMode: true });
  }
}
