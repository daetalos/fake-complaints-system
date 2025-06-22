import { test, expect } from '@playwright/test';

test.describe('Complaint Submission', () => {
  test('should allow a user to submit a complaint', async ({ page }) => {
    // Navigate to the new complaint page
    await page.goto('/complaints/new');

    // Find the description input and the submit button
    const descriptionInput = page.locator('textarea#description');
    const submitButton = page.locator('button[type="submit"]');

    // 1. Verify that submitting with an empty description shows a validation error
    await submitButton.click();
    
    const validationMessage = page.locator('p:has-text("Error: Description cannot be empty.")');
    await expect(validationMessage).toBeVisible();

    // 2. Fill in the description and submit the form
    await descriptionInput.fill('The service was not up to par.');
    await submitButton.click();

    // 3. Confirm that a success message is displayed
    const successMessage = page.locator('p:has-text("Complaint submitted successfully!")');
    await expect(successMessage).toBeVisible();

    // The test runner will automatically handle cleanup and closing the page.
  });
}); 