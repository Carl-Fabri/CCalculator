import {
  Component,
  AfterViewChecked,
  ElementRef,
  ViewChildren,
  ViewChild,
  QueryList,
  HostListener,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoulombStateService } from './services/coulomb-state.service';
import { CoulombLayoutService, SVG_W, SVG_H, CHARGE_R, AXIS_Y } from './services/coulomb-layout.service';
import { LatexRendererService } from './services/latex-renderer.service';

@Component({
  selector: 'app-coulomb-calculator',
  imports: [FormsModule],
  templateUrl: './coulomb-calculator.html',
  styleUrl: './coulomb-calculator.css',
})
export class CoulombCalculator implements AfterViewChecked {
  readonly state = inject(CoulombStateService);
  readonly layout = inject(CoulombLayoutService);
  private readonly latexRenderer = inject(LatexRendererService);

  readonly svgWidth = SVG_W;
  readonly svgHeight = SVG_H;
  readonly chargeRadius = CHARGE_R;
  readonly centerY = AXIS_Y;

  private dragging: 'q1' | 'q2' | null = null;
  isDraggingQ1 = false;
  isDraggingQ2 = false;

  @ViewChild('svgEl') private svgElRef!: ElementRef<SVGSVGElement>;
  @ViewChildren('katexEl') private katexEls!: QueryList<ElementRef>;
  private lastLatex = '';

  // --- Drag handlers ---

  onQ1MouseDown(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.dragging = 'q1';
    this.isDraggingQ1 = true;
  }

  onQ2MouseDown(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.dragging = 'q2';
    this.isDraggingQ2 = true;
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.dragging || !this.svgElRef) return;
    event.preventDefault();

    const clientX = event instanceof MouseEvent
      ? event.clientX
      : event.touches[0].clientX;

    const rect = this.svgElRef.nativeElement.getBoundingClientRect();
    const svgX = (clientX - rect.left) * (SVG_W / rect.width);

    if (this.dragging === 'q1') {
      this.layout.dragQ1(svgX);
    } else {
      this.layout.dragQ2(svgX);
    }
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onDragEnd(): void {
    this.dragging = null;
    this.isDraggingQ1 = false;
    this.isDraggingQ2 = false;
  }

  // --- Input handlers ---

  onQ1Input(raw: string): void { this.state.setQ1(parseFloat(raw)); }
  onQ2Input(raw: string): void { this.state.setQ2(parseFloat(raw)); }
  onDistInput(raw: string): void { this.state.setDistance(parseFloat(raw)); }

  // --- LaTeX rendering ---

  ngAfterViewChecked(): void {
    const current = this.state.coulombLatex();
    if (current !== this.lastLatex && this.katexEls?.length) {
      this.lastLatex = current;
      this.katexEls.forEach(({ nativeElement }) =>
        this.latexRenderer.render(nativeElement, current)
      );
    }
  }
}
