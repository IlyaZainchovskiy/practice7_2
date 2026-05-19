/**
 * Characterization tests — lock CURRENT legacy behavior (original/).
 */
import * as original from '../../original/payroll-calculator.js';
import { registerCharacterizationSuite } from './characterization-suite.js';

registerCharacterizationSuite('original', original);
