import { Component } from '@angular/core';
import { CoulombCalculator } from './coulomb-calculator/coulomb-calculator';

@Component({
  selector: 'app-root',
  imports: [CoulombCalculator],
  template: `<app-coulomb-calculator />`,
})
export class App {}
