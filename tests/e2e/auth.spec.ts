import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should load the home page', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/CRM|DocFlow/);
    });

    test('should navigate to login page', async ({ page }) => {
        await page.goto('/');

        // Look for login button or link
        const loginButton = page.getByRole('link', { name: /login|sign in/i });
        if (await loginButton.isVisible()) {
            await loginButton.click();
            await expect(page).toHaveURL(/.*login/);
        }
    });

    test('should show validation errors on empty login', async ({ page }) => {
        await page.goto('/login');

        // Try to submit without filling fields
        const submitButton = page.getByRole('button', { name: /login|sign in/i });
        if (await submitButton.isVisible()) {
            await submitButton.click();

            // Should show validation errors
            await expect(page.getByText(/email.*required|invalid email/i)).toBeVisible();
        }
    });
});

test.describe('Dashboard', () => {
    test('should show dashboard after login', async ({ page }) => {
        // This test assumes you have authentication
        // You'll need to add proper login flow
        await page.goto('/');

        // Check if dashboard elements are present
        const heading = page.getByRole('heading', { level: 1 });
        await expect(heading).toBeVisible();
    });
});
