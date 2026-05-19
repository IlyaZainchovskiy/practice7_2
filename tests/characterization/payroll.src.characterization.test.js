/**
 * Characterization tests — refactored module must match legacy behavior.
 */
import * as src from '../../src/payroll-calculator.js';
import { registerCharacterizationSuite } from './characterization-suite.js';

registerCharacterizationSuite('src', src);
