import { Injectable, computed, signal } from '@angular/core';

const K = 8.99e9;
const Q_MIN = -10;
const Q_MAX = 10;
const DIST_MIN = 0.1;
const DIST_MAX = 10;

@Injectable({ providedIn: 'root' })
export class CoulombStateService {
  readonly q1 = signal(4);
  readonly q2 = signal(-4);
  readonly distance = signal(1);
  readonly showScientific = signal(false);

  readonly force = computed(() => {
    const r = this.distance();
    if (r <= 0) return 0;
    return (K * Math.abs(this.q1() * 1e-6 * this.q2() * 1e-6)) / (r * r);
  });

  readonly isAttraction = computed(() => this.q1() * this.q2() < 0);
  readonly q1Color = computed(() => (this.q1() >= 0 ? '#ef4444' : '#3b82f6'));
  readonly q2Color = computed(() => (this.q2() >= 0 ? '#ef4444' : '#3b82f6'));

  readonly coulombLatex = computed(() => {
    const fStr = this.showScientific()
      ? this.toSciNotation(this.force())
      : this.force().toFixed(4) + ' \\text{ N}';
    return (
      `F = k \\frac{|q_1 \\cdot q_2|}{r^2} = ` +
      `\\frac{8.99 \\times 10^9 \\cdot |${this.q1()} \\times 10^{-6} \\cdot ${this.q2()} \\times 10^{-6}|}` +
      `{${this.distance()}^2} = ${fStr}`
    );
  });

  setQ1(value: number): void {
    if (!isNaN(value)) this.q1.set(this.clampCharge(value));
  }

  setQ2(value: number): void {
    if (!isNaN(value)) this.q2.set(this.clampCharge(value));
  }

  setDistance(value: number): void {
    if (!isNaN(value) && value > 0) this.distance.set(this.clampDistance(value));
  }

  toSciNotation(value: number): string {
    if (value === 0) return '0 \\text{ N}';
    const exp = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = value / Math.pow(10, exp);
    return `${mantissa.toFixed(3)} \\times 10^{${exp}} \\text{ N}`;
  }

  private clampCharge(v: number): number {
    return Math.max(Q_MIN, Math.min(Q_MAX, +v.toFixed(2)));
  }

  private clampDistance(v: number): number {
    return Math.max(DIST_MIN, Math.min(DIST_MAX, +v.toFixed(2)));
  }
}
