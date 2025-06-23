import { test, expect } from '@playwright/test';

test.describe('Address Capture Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API responses for consistent testing
    await page.route('/api/complaint-categories/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            main_category: 'Clinical',
            sub_categories: [
              { category_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', sub_category: 'Diagnosis' },
              { category_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480', sub_category: 'Treatment' },
            ],
          },
          {
            main_category: 'Administrative',
            sub_categories: [
              { category_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481', sub_category: 'Billing' },
            ],
          },
        ]),
      });
    });

    await page.route('/api/patients*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            patient_id: 'patient-123',
            name: 'John Patient',
            dob: '1990-01-01T00:00:00Z'
          }
        ]),
      });
    });

    await page.route('/api/cases*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            case_id: 'case-456',
            case_reference: 'CASE-2024-001',
            patient_id: 'patient-123'
          }
        ]),
      });
    });

    await page.route('/api/complainants*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });
  });

  test('should complete full address capture workflow with new complainant', async ({ page }) => {
    // Navigate to the new complaint page
    await page.goto('/complaints/new');

    // Wait for the form to load
    await expect(page.locator('text=Complainant Information')).toBeVisible();

    // Step 1: Fill in complainant information with address
    await page.fill('input[name="complainantName"]', 'Jane Smith');
    await page.fill('input[name="complainantEmail"]', 'jane.smith@example.com');
    await page.fill('input[name="complainantPhone"]', '07123456789');
    await page.fill('input[name="addressLine1"]', '123 Main Street');
    await page.fill('input[name="addressLine2"]', 'Apartment 4B');
    await page.fill('input[name="city"]', 'London');
    await page.fill('input[name="postcode"]', 'SW1A 1AA');

    // Click Next to proceed to complaint details
    await page.click('button:has-text("Next")');

    // Step 2: Fill in complaint details
    await expect(page.locator('text=Complaint Category')).toBeVisible();
    
    // Select main category
    await page.selectOption('select[name="selectedMainCategory"]', 'Clinical');
    
    // Select sub-category
    await page.selectOption('select[name="selectedSubCategory"]', 'f47ac10b-58cc-4372-a567-0e02b2c3d479');
    
    // Select patient
    await page.click('input[placeholder*="Search patients"]');
    await page.fill('input[placeholder*="Search patients"]', 'John');
    await page.click('text=John Patient');
    
    // Select case
    await page.selectOption('select[name="selectedCase"]', 'case-456');
    
    // Fill description
    await page.fill('textarea[name="description"]', 'This is a detailed description of the complaint regarding the diagnosis provided. The issue occurred on multiple occasions and needs investigation.');

    // Click Next to proceed to review
    await page.click('button:has-text("Next")');

    // Step 3: Review information
    await expect(page.locator('text=Review & Submit')).toBeVisible();
    
    // Verify complainant information is displayed correctly
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    await expect(page.locator('text=jane.smith@example.com')).toBeVisible();
    await expect(page.locator('text=123 Main Street, London SW1A 1AA')).toBeVisible();
    
    // Verify complaint details are displayed
    await expect(page.locator('text=Clinical')).toBeVisible();
    await expect(page.locator('text=John Patient')).toBeVisible();
    await expect(page.locator('text=CASE-2024-001')).toBeVisible();

    // Mock the complaint submission
    await page.route('**/api/complainants/', async (route) => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        
        // Verify the complainant data includes all address fields
        expect(postData.name).toBe('Jane Smith');
        expect(postData.email).toBe('jane.smith@example.com');
        expect(postData.address_line1).toBe('123 Main Street');
        expect(postData.address_line2).toBe('Apartment 4B');
        expect(postData.city).toBe('London');
        expect(postData.postcode).toBe('SW1A 1AA');

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            complainant_id: 'complainant-789',
            name: postData.name,
            email: postData.email,
            phone: postData.phone,
            address_line1: postData.address_line1,
            address_line2: postData.address_line2,
            city: postData.city,
            postcode: postData.postcode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      }
    });

    await page.route('**/api/complaints/', async (route) => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        
        // Verify the complaint includes complainant_id
        expect(postData.complainant_id).toBe('complainant-789');
        expect(postData.description).toContain('detailed description');
        expect(postData.category_id).toBe('f47ac10b-58cc-4372-a567-0e02b2c3d479');

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            complaint_id: 'complaint-999',
            description: postData.description,
            category_id: postData.category_id,
            complainant_id: postData.complainant_id,
            patient_id: postData.patient_id,
            case_id: postData.case_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            complainant: {
              complainant_id: 'complainant-789',
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
              address_line1: '123 Main Street',
              address_line2: 'Apartment 4B',
              city: 'London',
              postcode: 'SW1A 1AA'
            },
            patient: { patient_id: 'patient-123', name: 'John Patient', dob: '1990-01-01T00:00:00Z' },
            case: { case_id: 'case-456', case_reference: 'CASE-2024-001', patient_id: 'patient-123' }
          }),
        });
      }
    });

    // Submit the complaint
    await page.click('button:has-text("Submit Complaint")');

    // Verify success message
    await expect(page.locator('text=Complaint Submitted Successfully!')).toBeVisible();
    await expect(page.locator('text=Reference ID: complaint-999')).toBeVisible();
  });

  test('should validate required address fields', async ({ page }) => {
    await page.goto('/complaints/new');

    // Try to proceed without filling required address fields
    await page.fill('input[name="complainantName"]', 'John Doe');
    await page.fill('input[name="complainantEmail"]', 'john@example.com');
    // Leave address fields empty

    await page.click('button:has-text("Next")');

    // Should show validation errors for required address fields
    await expect(page.locator('text=Address line 1 is required')).toBeVisible();
    await expect(page.locator('text=City is required')).toBeVisible();
    await expect(page.locator('text=Postcode is required')).toBeVisible();

    // Should not proceed to next step
    await expect(page.locator('text=Complaint Category')).not.toBeVisible();
  });

  test('should validate address field formats', async ({ page }) => {
    await page.goto('/complaints/new');

    // Fill with invalid data
    await page.fill('input[name="complainantName"]', 'J'); // Too short
    await page.fill('input[name="complainantEmail"]', 'invalid-email'); // Invalid email
    await page.fill('input[name="addressLine1"]', '123'); // Too short
    await page.fill('input[name="city"]', 'L'); // Too short
    await page.fill('input[name="postcode"]', 'SW'); // Too short

    await page.click('button:has-text("Next")');

    // Should show validation errors
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible();
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    await expect(page.locator('text=Address must be at least 5 characters')).toBeVisible();
    await expect(page.locator('text=City must be at least 2 characters')).toBeVisible();
    await expect(page.locator('text=Postcode must be at least 3 characters')).toBeVisible();
  });

  test('should allow using existing complainant', async ({ page }) => {
    // Mock existing complainant search
    await page.route('/api/complainants*', async route => {
      if (route.request().method() === 'GET') {
        const url = new URL(route.request().url());
        const query = url.searchParams.get('q');
        
        if (query && query.includes('existing')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                complainant_id: 'existing-complainant-123',
                name: 'Existing User',
                email: 'existing@example.com',
                address_line1: '456 Oak Street',
                address_line2: null,
                city: 'Manchester',
                postcode: 'M1 1AA'
              }
            ]),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
        }
      }
    });

    await page.goto('/complaints/new');

    // Search for existing complainant
    await page.fill('input[placeholder*="Type name or email to search"]', 'existing');
    
    // Wait for search results and select complainant
    await page.waitForSelector('text=Existing User');
    await page.click('text=Existing User');

    // Verify form is populated with existing complainant data
    await expect(page.locator('input[name="complainantName"]')).toHaveValue('Existing User');
    await expect(page.locator('input[name="complainantEmail"]')).toHaveValue('existing@example.com');
    await expect(page.locator('input[name="addressLine1"]')).toHaveValue('456 Oak Street');
    await expect(page.locator('input[name="city"]')).toHaveValue('Manchester');
    await expect(page.locator('input[name="postcode"]')).toHaveValue('M1 1AA');

    // Should show info message
    await expect(page.locator('text=Using existing complainant: Existing User')).toBeVisible();

    // Should be able to proceed to next step
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Complaint Category')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/complaints/new');

    // Fill valid form data
    await page.fill('input[name="complainantName"]', 'Test User');
    await page.fill('input[name="complainantEmail"]', 'test@example.com');
    await page.fill('input[name="addressLine1"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="postcode"]', 'T1 1AA');

    await page.click('button:has-text("Next")');

    // Fill complaint details
    await page.selectOption('select[name="selectedMainCategory"]', 'Clinical');
    await page.selectOption('select[name="selectedSubCategory"]', 'f47ac10b-58cc-4372-a567-0e02b2c3d479');
    await page.click('input[placeholder*="Search patients"]');
    await page.fill('input[placeholder*="Search patients"]', 'John');
    await page.click('text=John Patient');
    await page.selectOption('select[name="selectedCase"]', 'case-456');
    await page.fill('textarea[name="description"]', 'Test complaint description with sufficient length to pass validation requirements.');

    await page.click('button:has-text("Next")');

    // Mock API error
    await page.route('**/api/complainants/', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            detail: 'Invalid address format'
          }),
        });
      }
    });

    // Submit and expect error handling
    await page.click('button:has-text("Submit Complaint")');

    // Should show error message
    await expect(page.locator('text=Invalid address format')).toBeVisible();
    
    // Should not show success message
    await expect(page.locator('text=Complaint Submitted Successfully!')).not.toBeVisible();
  });
}); 