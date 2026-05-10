import {
  Component,
  computed,
  signal,
  AfterViewChecked,
  ElementRef,
  ViewChildren,
  ViewChild,
  QueryList,
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import katex from 'katex';

const K = 8.99e9;

// SVG layout constants
const SVG_W = 600;
const SVG_H = 160;
const R = 30;          // charge circle radius
const Q1_X = SVG_W * 0.28;   // fixed x for q1 (~168)
const AXIS_Y = SVG_H / 2;    // 80

// q2 drag range in SVG pixels
const Q2_MIN_X = Q1_X + R * 2 + 40;  // minimum gap between circles
const Q2_MAX_X = SVG_W - R - 20;

// Distance range (meters)
const DIST_MIN = 0.1;
const DIST_MAX = 10;

function svgXToDistance(svgX: number): number {
  const t = (svgX - Q2_MIN_X) / (Q2_MAX_X - Q2_MIN_X);
  return Math.round((DIST_MIN + t * (DIST_MAX - DIST_MIN)) * 10) / 10;
}

function distanceToSvgX(dist: number): number {
  const t = (dist - DIST_MIN) / (DIST_MAX - DIST_MIN);
  return Q2_MIN_X + t * (Q2_MAX_X - Q2_MIN_X);
}

@Component({
  selector: 'app-coulomb-calculator',
  imports: [FormsModule],
  templateUrl: './coulomb-calculator.html',
  styleUrl: './coulomb-calculator.css',
})
export class CoulombCalculator implements AfterViewChecked {
  q1 = signal(4);
  q2 = signal(-4);
  distance = signal(1);
  showScientific = signal(false);

  // Expose layout constants to template
  readonly svgWidth = SVG_W;
  readonly svgHeight = SVG_H;
  readonly chargeRadius = R;
  readonly centerY = AXIS_Y;

  // Positions
  q1Pos = { x: Q1_X, y: AXIS_Y };
  q2Pos = computed(() => ({ x: distanceToSvgX(this.distance()), y: AXIS_Y }));

  // Physics
  force = computed(() => {
    const r = this.distance();
    if (r <= 0) return 0;
    return (K * Math.abs(this.q1() * 1e-6 * this.q2() * 1e-6)) / (r * r);
  });

  isAttraction = computed(() => this.q1() * this.q2() < 0);

  q1Color = computed(() => (this.q1() >= 0 ? '#ef4444' : '#3b82f6'));
  q2Color = computed(() => (this.q2() >= 0 ? '#ef4444' : '#3b82f6'));

  // Arrow positions
  readonly arrowLength = 40;
  q1ArrowX2 = computed(() =>
    this.isAttraction()
      ? this.q1Pos.x + R + this.arrowLength
      : this.q1Pos.x - R - this.arrowLength
  );
  q2ArrowX2 = computed(() =>
    this.isAttraction()
      ? this.q2Pos().x - R - this.arrowLength
      : this.q2Pos().x + R + this.arrowLength
  );

  // Drag state
  private dragging: 'q2' | null = null;
  isDraggingQ2 = false;

  @ViewChild('svgEl') svgElRef!: ElementRef<SVGSVGElement>;

  onQ2MouseDown(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.dragging = 'q2';
    this.isDraggingQ2 = true;
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.dragging || !this.svgElRef) return;
    event.preventDefault();

    const clientX = event instanceof MouseEvent
      ? event.clientX
      : event.touches[0].clientX;

    const rect = this.svgElRef.nativeElement.getBoundingClientRect();
    const scaleX = SVG_W / rect.width;
    const svgX = (clientX - rect.left) * scaleX;
    const clampedX = Math.max(Q2_MIN_X, Math.min(Q2_MAX_X, svgX));
    this.distance.set(svgXToDistance(clampedX));
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onDragEnd() {
    this.dragging = null;
    this.isDraggingQ2 = false;
  }

  // Keyboard input handlers — clamp and round on commit
  onQ1Input(raw: string) {
    const v = parseFloat(raw);
    if (!isNaN(v)) this.q1.set(Math.max(-10, Math.min(10, +v.toFixed(2))));
  }

  onQ2Input(raw: string) {
    const v = parseFloat(raw);
    if (!isNaN(v)) this.q2.set(Math.max(-10, Math.min(10, +v.toFixed(2))));
  }

  onDistInput(raw: string) {
    const v = parseFloat(raw);
    if (!isNaN(v) && v > 0) this.distance.set(Math.max(DIST_MIN, Math.min(DIST_MAX, +v.toFixed(2))));
  }

  // LaTeX
  private toSciLatex(value: number): string {
    if (value === 0) return '0 \\text{ N}';
    const exp = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = value / Math.pow(10, exp);
    return `${mantissa.toFixed(3)} \\times 10^{${exp}} \\text{ N}`;
  }

  coulombLatex = computed(() => {
    const q1 = this.q1();
    const q2 = this.q2();
    const r = this.distance();
    const fStr = this.showScientific()
      ? this.toSciLatex(this.force())
      : this.force().toFixed(4) + ' \\text{ N}';
    return `F = k \\frac{|q_1 \\cdot q_2|}{r^2} = \\frac{8.99 \\times 10^9 \\cdot |${q1} \\times 10^{-6} \\cdot ${q2} \\times 10^{-6}|}{${r}^2} = ${fStr}`;
  });

  @ViewChildren('katexEl') katexEls!: QueryList<ElementRef>;
  private lastLatex = '';

  ngAfterViewChecked() {
    const latex = this.coulombLatex();
    if (latex !== this.lastLatex && this.katexEls?.length) {
      this.lastLatex = latex;
      this.katexEls.forEach((el) => {
        katex.render(latex, el.nativeElement, { throwOnError: false, displayMode: true });
      });
    }
  }
}
