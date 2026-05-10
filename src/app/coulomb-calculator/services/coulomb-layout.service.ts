import { Injectable, computed } from '@angular/core';
import { CoulombStateService } from './coulomb-state.service';

export const SVG_W = 600;
export const SVG_H = 160;
export const CHARGE_R = 30;
export const Q1_X = SVG_W * 0.28;
export const AXIS_Y = SVG_H / 2;
export const Q2_MIN_X = Q1_X + CHARGE_R * 2 + 40;
export const Q2_MAX_X = SVG_W - CHARGE_R - 20;
export const DIST_MIN = 0.1;
export const DIST_MAX = 10;

const ARROW_LEN = 40;

@Injectable({ providedIn: 'root' })
export class CoulombLayoutService {
  constructor(private state: CoulombStateService) {}

  readonly q1Pos = { x: Q1_X, y: AXIS_Y };

  readonly q2Pos = computed(() => ({
    x: this.distanceToSvgX(this.state.distance()),
    y: AXIS_Y,
  }));

  readonly q1ArrowX2 = computed(() =>
    this.state.isAttraction()
      ? Q1_X + CHARGE_R + ARROW_LEN
      : Q1_X - CHARGE_R - ARROW_LEN
  );

  readonly q2ArrowX2 = computed(() =>
    this.state.isAttraction()
      ? this.q2Pos().x - CHARGE_R - ARROW_LEN
      : this.q2Pos().x + CHARGE_R + ARROW_LEN
  );

  svgXToDistance(svgX: number): number {
    const t = (svgX - Q2_MIN_X) / (Q2_MAX_X - Q2_MIN_X);
    const raw = DIST_MIN + t * (DIST_MAX - DIST_MIN);
    return Math.round(Math.max(DIST_MIN, Math.min(DIST_MAX, raw)) * 10) / 10;
  }

  distanceToSvgX(dist: number): number {
    const t = (dist - DIST_MIN) / (DIST_MAX - DIST_MIN);
    return Q2_MIN_X + t * (Q2_MAX_X - Q2_MIN_X);
  }
}
