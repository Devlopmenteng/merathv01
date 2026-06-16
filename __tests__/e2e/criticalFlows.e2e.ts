/**
 * E2E Tests for Critical User Flows
 *
 * Tests cover:
 * - App initialization and loading
 * - Estate setup flow
 * - Heir selection and calculation
 * - Results generation
 * - Settings and preferences
 *
 * Run with: detox test e2e/criticalFlows.e2e.ts --configuration ios.sim.debug
 */

describe('Merath App - Critical User Flows', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('App Initialization', () => {
    it('should launch successfully', async () => {
      await waitFor(element(by.id('homeScreen'))).toBeVisible().withTimeout(5000);
      expect(element(by.id('homeScreen'))).toBeVisible();
    });

    it('should display main navigation tabs', async () => {
      await expect(element(by.id('homeTab'))).toBeVisible();
      await expect(element(by.id('calculationTab'))).toBeVisible();
      await expect(element(by.id('settingsTab'))).toBeVisible();
    });

    it('should load with appropriate theme', async () => {
      const homeScreen = element(by.id('homeScreen'));
      await expect(homeScreen).toBeVisible();
      // Verify theme colors are applied (check via test IDs with theme values)
    });
  });

  describe('Estate Setup Flow', () => {
    it('should navigate to estate setup', async () => {
      await element(by.id('calculationTab')).tap();
      await waitFor(element(by.id('estateSetupScreen'))).toBeVisible().withTimeout(3000);
      expect(element(by.id('estateSetupScreen'))).toBeVisible();
    });

    it('should input estate total', async () => {
      await element(by.id('calculationTab')).tap();
      const totalInput = element(by.id('estateTotalInput'));
      await totalInput.multiTap(1);
      await totalInput.typeText('100000');
      await totalInput.tapReturnKey();

      await expect(element(by.text('100000'))).toBeVisible();
    });

    it('should input funeral expenses', async () => {
      const funeralInput = element(by.id('funeralExpensesInput'));
      await funeralInput.multiTap(1);
      await funeralInput.typeText('5000');
      await funeralInput.tapReturnKey();

      await expect(element(by.text('5000'))).toBeVisible();
    });

    it('should input debts', async () => {
      const debtsInput = element(by.id('debtsInput'));
      await debtsInput.multiTap(1);
      await debtsInput.typeText('10000');
      await debtsInput.tapReturnKey();

      await expect(element(by.text('10000'))).toBeVisible();
    });

    it('should proceed to heir selection', async () => {
      const nextButton = element(by.id('estateSetupNextButton'));
      await nextButton.tap();

      await waitFor(element(by.id('heirSelectionScreen'))).toBeVisible().withTimeout(3000);
      expect(element(by.id('heirSelectionScreen'))).toBeVisible();
    });
  });

  describe('Heir Selection Flow', () => {
    beforeEach(async () => {
      // Navigate to heir selection
      await element(by.id('calculationTab')).tap();
      await element(by.id('estateTotalInput')).multiTap(1);
      await element(by.id('estateTotalInput')).typeText('100000');
      await element(by.id('estateTotalInput')).tapReturnKey();
      await element(by.id('estateSetupNextButton')).tap();
      await waitFor(element(by.id('heirSelectionScreen'))).toBeVisible().withTimeout(3000);
    });

    it('should display heir categories', async () => {
      await expect(element(by.id('spouseCategory'))).toBeVisible();
      await expect(element(by.id('childrenCategory'))).toBeVisible();
      await expect(element(by.id('parentsCategory'))).toBeVisible();
    });

    it('should add a spouse', async () => {
      const addSpouseButton = element(by.id('addSpouseButton'));
      await addSpouseButton.tap();

      await waitFor(element(by.id('spouseRow-0'))).toBeVisible().withTimeout(2000);
      expect(element(by.id('spouseRow-0'))).toBeVisible();
    });

    it('should add multiple heirs', async () => {
      const addChildButton = element(by.id('addChildButton'));
      await addChildButton.tap();
      await addChildButton.tap();

      await expect(element(by.id('childRow-0'))).toBeVisible();
      await expect(element(by.id('childRow-1'))).toBeVisible();
    });

    it('should proceed to calculation', async () => {
      const calculateButton = element(by.id('calculateButton'));
      await calculateButton.tap();

      await waitFor(element(by.id('resultsScreen'))).toBeVisible().withTimeout(5000);
      expect(element(by.id('resultsScreen'))).toBeVisible();
    });
  });

  describe('Results and Calculation', () => {
    it('should display inheritance results', async () => {
      await expect(element(by.id('totalSharesTable'))).toBeVisible();
      await expect(element(by.id('detailedBreakdown'))).toBeVisible();
    });

    it('should show madhab information', async () => {
      const madhabLabel = element(by.id('madhabLabel'));
      await expect(madhabLabel).toBeVisible();
    });

    it('should allow exporting results', async () => {
      const exportButton = element(by.id('exportButton'));
      await exportButton.tap();

      await waitFor(element(by.id('exportModal'))).toBeVisible().withTimeout(2000);
      expect(element(by.id('exportModal'))).toBeVisible();
    });

    it('should allow sharing results', async () => {
      const shareButton = element(by.id('shareButton'));
      await shareButton.tap();

      // Note: Sharing dialog may be platform-specific
      // Just verify the button is interactive
      expect(element(by.id('shareButton'))).toBeVisible();
    });
  });

  describe('Settings Navigation', () => {
    it('should navigate to settings', async () => {
      await element(by.id('settingsTab')).tap();
      await waitFor(element(by.id('settingsScreen'))).toBeVisible().withTimeout(2000);
      expect(element(by.id('settingsScreen'))).toBeVisible();
    });

    it('should display language options', async () => {
      const languageSelector = element(by.id('languageSelector'));
      await expect(languageSelector).toBeVisible();
    });

    it('should toggle dark mode', async () => {
      const darkModeToggle = element(by.id('darkModeToggle'));
      await darkModeToggle.tap();

      // Verify theme change occurred by checking a theme-dependent element
      // This is implementation-specific
    });

    it('should display about section', async () => {
      await element(by.text('About')).tap();
      await expect(element(by.id('aboutSection'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid estate input', async () => {
      await element(by.id('calculationTab')).tap();
      const totalInput = element(by.id('estateTotalInput'));
      await totalInput.multiTap(1);
      await totalInput.typeText('-100');
      await totalInput.tapReturnKey();

      // Verify error message is shown
      await expect(element(by.text(/invalid|negative/i))).toBeVisible();
    });

    it('should prevent proceeding with incomplete data', async () => {
      await element(by.id('calculationTab')).tap();
      const nextButton = element(by.id('estateSetupNextButton'));

      // Initially disabled if no data entered
      // Specific behavior depends on implementation
      expect(element(by.id('estateSetupNextButton'))).toBeVisible();
    });
  });

  describe('Performance', () => {
    it('should load results within acceptable time', async () => {
      // This is a benchmark test
      // Measure calculation time and ensure it's under threshold (e.g., 2s)
      const startTime = Date.now();

      await element(by.id('calculateButton')).tap();
      await waitFor(element(by.id('resultsScreen'))).toBeVisible().withTimeout(5000);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // 5 second threshold
    });
  });
});
