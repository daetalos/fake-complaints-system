import { test, expect } from '@playwright/test';

test.describe('Complaint Submission', () => {
  test('should show a validation error if submitted empty', async ({ page }) => {
    // Navigate to the new complaint page
    await page.goto('/complaints/new');

    // Find the submit button and click it
    await page.locator('button[type="submit"]').click();
    
    // Verify that the correct validation message is shown
    const validationMessage = page.locator('p:has-text("Error: Please fill in all fields.")');
    await expect(validationMessage).toBeVisible();
  });

  test('should allow a user to select a category and submit a complaint', async ({ page }) => {
    // Mock the API response for categories
    const mockCategories = [
      {
        main_category: 'Clinical',
        sub_categories: [
          { category_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', sub_category: 'Diagnosis' },
          { category_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480', sub_category: 'Medication' },
        ],
      },
      {
        main_category: 'Administrative',
        sub_categories: [
          { category_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481', sub_category: 'Billing' },
        ],
      },
    ];

    await page.route('/api/complaint-categories/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCategories),
      });
    });

    // Navigate to the new complaint page
    await page.goto('/complaints/new');

    // Select main category
    await page.locator('select#main-category').selectOption('Clinical');

    // Wait for the subcategory dropdown to be enabled and populated, then select an option
    const subCategorySelector = page.locator('select#sub-category');
    await expect(subCategorySelector).toBeEnabled();
    await expect(subCategorySelector.locator('option', { hasText: 'Diagnosis' })).toHaveCount(1);
    await subCategorySelector.selectOption({ label: 'Diagnosis' });

    // Fill in the description
    await page.locator('textarea#description').fill('The diagnosis was incorrect.');

    // Intercept the POST request to verify the payload and mock the response
    await page.route('**/api/complaints/', async (route) => {
      const postData = route.request().postDataJSON();
      // Assert the payload
      expect(postData.description).toBe('The diagnosis was incorrect.');
      expect(postData.category_id).toBe('f47ac10b-58cc-4372-a567-0e02b2c3d479');

      // Fulfill the request with a mock success response
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          description: postData.description,
          complaint_id: 'mock-complaint-id-12345',
          category_id: postData.category_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    // Submit the form
    await page.locator('button[type="submit"]').click();

    // Confirm success message
    const successMessage = page.locator('p:has-text("Complaint submitted successfully!")');
    await expect(successMessage).toBeVisible();
  });
}); 