/**
 * Unit tests for Decay Physics calculations
 *
 * Tests the core decay formulas to ensure visual effects
 * match the intended exponential decay curve.
 */

import { calculateDecayMetrics, calculateDaysSinceActivity } from "./DecayingDealCard";

describe("Decay Physics System", () => {
  describe("calculateDaysSinceActivity", () => {
    it("should return 0 for null date", () => {
      const days = calculateDaysSinceActivity(null);
      expect(days).toBe(0);
    });

    it("should return 0 for undefined date", () => {
      const days = calculateDaysSinceActivity(undefined);
      expect(days).toBe(0);
    });

    it("should calculate days correctly for past date", () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const days = calculateDaysSinceActivity(sevenDaysAgo.toISOString());
      expect(days).toBe(7);
    });

    it("should handle invalid date strings gracefully", () => {
      const days = calculateDaysSinceActivity("not-a-date");
      expect(days).toBe(0);
    });
  });

  describe("calculateDecayMetrics", () => {
    describe("Fresh stage (0-2 days)", () => {
      it("should have no decay effects at 0 days", () => {
        const metrics = calculateDecayMetrics(0);

        expect(metrics.decayLevel).toBe("fresh");
        expect(metrics.opacityMultiplier).toBe(1.0);
        expect(metrics.saturationPercent).toBe(100);
        expect(metrics.contrastPercent).toBe(100);
        expect(metrics.showRedBorder).toBe(false);
        expect(metrics.showPulsingAlert).toBe(false);
      });

      it("should have minimal decay at 2 days", () => {
        const metrics = calculateDecayMetrics(2);

        expect(metrics.decayLevel).toBe("fresh");
        expect(metrics.opacityMultiplier).toBeGreaterThan(0.95);
        expect(metrics.showRedBorder).toBe(false);
      });
    });

    describe("Warm stage (3-6 days)", () => {
      it("should show subtle decay at 3 days", () => {
        const metrics = calculateDecayMetrics(3);

        expect(metrics.decayLevel).toBe("fresh");
        expect(metrics.opacityMultiplier).toBeGreaterThan(0.8);
        expect(metrics.saturationPercent).toBeGreaterThan(80);
        expect(metrics.showRedBorder).toBe(false);
      });

      it("should have noticeable decay at 6 days", () => {
        const metrics = calculateDecayMetrics(6);

        expect(metrics.decayLevel).toBe("fresh");
        expect(metrics.opacityMultiplier).toBeGreaterThan(0.7);
        expect(metrics.saturationPercent).toBeGreaterThan(60);
        expect(metrics.showRedBorder).toBe(false);
      });
    });

    describe("Aging stage (7-9 days)", () => {
      it("should trigger red border at 7 days", () => {
        const metrics = calculateDecayMetrics(7);

        expect(metrics.decayLevel).toBe("aging");
        expect(metrics.showRedBorder).toBe(true);
        expect(metrics.showPulsingAlert).toBe(false);
        expect(metrics.tooltipMessage).toContain("Aging deal");
      });

      it("should maintain red border at 9 days", () => {
        const metrics = calculateDecayMetrics(9);

        expect(metrics.decayLevel).toBe("aging");
        expect(metrics.showRedBorder).toBe(true);
        expect(metrics.showPulsingAlert).toBe(false);
      });
    });

    describe("Stale stage (10-14 days)", () => {
      it("should trigger pulsing alert at 10 days", () => {
        const metrics = calculateDecayMetrics(10);

        expect(metrics.decayLevel).toBe("stale");
        expect(metrics.showRedBorder).toBe(true);
        expect(metrics.showPulsingAlert).toBe(true);
        expect(metrics.tooltipMessage).toContain("Stale deal");
      });

      it("should have significant decay at 14 days", () => {
        const metrics = calculateDecayMetrics(14);

        expect(metrics.decayLevel).toBe("stale");
        expect(metrics.opacityMultiplier).toBeLessThan(0.7);
        expect(metrics.saturationPercent).toBeLessThan(50);
      });
    });

    describe("Critical stage (15+ days)", () => {
      it("should be critical at 15 days", () => {
        const metrics = calculateDecayMetrics(15);

        expect(metrics.decayLevel).toBe("critical");
        expect(metrics.showRedBorder).toBe(true);
        expect(metrics.showPulsingAlert).toBe(true);
        expect(metrics.tooltipMessage).toContain("CRITICAL");
      });

      it("should have maximum decay at 30+ days", () => {
        const metrics = calculateDecayMetrics(30);

        expect(metrics.decayLevel).toBe("critical");
        expect(metrics.opacityMultiplier).toBe(0.5); // Clamped at minimum
        expect(metrics.saturationPercent).toBe(30); // Clamped at minimum
        expect(metrics.contrastPercent).toBe(60); // Clamped at minimum
      });

      it("should not decay beyond 30 day caps for extreme values", () => {
        const metrics = calculateDecayMetrics(365); // 1 year

        // Should be same as 30 days due to capping
        expect(metrics.opacityMultiplier).toBe(0.5);
        expect(metrics.saturationPercent).toBe(30);
        expect(metrics.contrastPercent).toBe(60);
      });
    });

    describe("Decay curve properties", () => {
      it("should have exponential decay (accelerating)", () => {
        const day5 = calculateDecayMetrics(5);
        const day10 = calculateDecayMetrics(10);
        const day15 = calculateDecayMetrics(15);

        // Opacity should decrease faster in later days (exponential)
        const firstPeriodChange = day5.opacityMultiplier - day10.opacityMultiplier;
        const secondPeriodChange = day10.opacityMultiplier - day15.opacityMultiplier;

        // Second period should have larger change (acceleration)
        expect(secondPeriodChange).toBeGreaterThan(firstPeriodChange);
      });

      it("should never go below minimum thresholds", () => {
        const extremeDecay = calculateDecayMetrics(1000);

        expect(extremeDecay.opacityMultiplier).toBeGreaterThanOrEqual(0.5);
        expect(extremeDecay.saturationPercent).toBeGreaterThanOrEqual(30);
        expect(extremeDecay.contrastPercent).toBeGreaterThanOrEqual(60);
      });

      it("should never exceed maximum values", () => {
        const noDecay = calculateDecayMetrics(0);

        expect(noDecay.opacityMultiplier).toBeLessThanOrEqual(1.0);
        expect(noDecay.saturationPercent).toBeLessThanOrEqual(100);
        expect(noDecay.contrastPercent).toBeLessThanOrEqual(100);
      });
    });

    describe("Tooltip messages", () => {
      it("should have contextual messages for each stage", () => {
        const fresh = calculateDecayMetrics(0);
        const aging = calculateDecayMetrics(7);
        const stale = calculateDecayMetrics(10);
        const critical = calculateDecayMetrics(15);

        expect(fresh.tooltipMessage).toContain("Active");
        expect(aging.tooltipMessage).toContain("Aging");
        expect(stale.tooltipMessage).toContain("Stale");
        expect(critical.tooltipMessage).toContain("CRITICAL");
      });

      it("should include day count in messages", () => {
        const metrics = calculateDecayMetrics(12);
        expect(metrics.tooltipMessage).toContain("12");
      });
    });
  });

  describe("Threshold boundaries", () => {
    it("should handle exact threshold values correctly", () => {
      const day7 = calculateDecayMetrics(7);
      const day10 = calculateDecayMetrics(10);
      const day15 = calculateDecayMetrics(15);

      expect(day7.showRedBorder).toBe(true);
      expect(day7.showPulsingAlert).toBe(false);

      expect(day10.showRedBorder).toBe(true);
      expect(day10.showPulsingAlert).toBe(true);

      expect(day15.decayLevel).toBe("critical");
    });

    it("should handle boundary -1 correctly", () => {
      const day6 = calculateDecayMetrics(6);
      const day9 = calculateDecayMetrics(9);
      const day14 = calculateDecayMetrics(14);

      expect(day6.showRedBorder).toBe(false);
      expect(day9.showPulsingAlert).toBe(false);
      expect(day14.decayLevel).toBe("stale");
    });
  });
});

/**
 * Visual Regression Test Cases (Manual)
 *
 * These should be verified visually in Storybook or demo page:
 *
 * 1. Opacity decrease should be smooth and gradual
 * 2. Red border should pulse with 2-second breathing cycle
 * 3. Alert icon should scale pulse with 1.5-second cycle
 * 4. Tooltip should appear on hover without layout shift
 * 5. Decay effects should not interfere with drag interactions
 * 6. Color desaturation should be visually noticeable by day 10
 * 7. Skull icon should be clearly distinct from alert triangle
 * 8. Hover effects should still work on heavily decayed cards
 */
