import { Injectable, computed, signal } from '@angular/core';
import { CoulombStateService } from './coulomb-state.service';

export const SVG_W = 600;
export const SVG_H = 160;
export const CHARGE_R = 30;
export const AXIS_Y = SVG_H / 2;

const Q1_X_DEFAULT = SVG_W * 0.28;   // ~168
const Q1_X_MIN = CHARGE_R + 20;      // 50  — left wall
const MIN_GAP = CHARGE_R * 2 + 40;   // 100 — minimum gap between circle edges
const Q2_X_MAX = SVG_W - CHARGE_R - 20; // 550 — right wall

// Fixed px/m scale anchored to the default q1 position
const PX_PER_M = (Q2_X_MAX - Q1_X_DEFAULT - MIN_GAP) / 9.9; // ~28.5 px/m

const ARROW_LEN = 40;

@Injectable({ providedIn: 'root' })
export class CoulombLayoutService {
  constructor(private state: CoulombStateService) {}

  // q1 horizontal position is now draggable
  readonly q1X = signal(Q1_X_DEFAULT);

  readonly q1Pos = computed(() => ({ x: this.q1X(), y: AXIS_Y }));

  readonly q2Pos = computed(() => ({
    x: Math.min(Q2_X_MAX, this.q1X() + MIN_GAP + (this.state.distance() - 0.1) * PX_PER_M),
    y: AXIS_Y,
  }));

  readonly q1ArrowX2 = computed(() =>
    this.state.isAttraction()
      ? this.q1X() + CHARGE_R + ARROW_LEN
      : this.q1X() - CHARGE_R - ARROW_LEN
  );

  readonly q2ArrowX2 = computed(() =>
    this.state.isAttraction()
      ? this.q2Pos().x - CHARGE_R - ARROW_LEN
      : this.q2Pos().x + CHARGE_R + ARROW_LEN
  );

  // Called when q1 is dragged — clamps so q2 never leaves the right wall
  dragQ1(svgX: number): void {
    const maxQ1X = Q2_X_MAX - MIN_GAP - (this.state.distance() - 0.1) * PX_PER_M;
    this.q1X.set(Math.max(Q1_X_MIN, Math.min(maxQ1X, svgX)));
  }

  // Called when q2 is dragged — converts pixel offset to distance
  dragQ2(svgX: number): void {
    const rawDist = 0.1 + (svgX - this.q1X() - MIN_GAP) / PX_PER_M;
    this.state.setDistance(rawDist);
  }
}
