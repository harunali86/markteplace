import { test, expect } from '@playwright/test';

test.describe('Public Marketplace Visibility', () => {
    test('should load the landing page and show all vertical categories', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/Doossh/);

        // Verify presence of main categories in navbar
        await expect(page.getByRole('navigation').getByText('Restaurants', { exact: false })).toBeVisible();
        await expect(page.getByRole('navigation').getByText('Nightlife', { exact: false })).toBeVisible();
        await expect(page.getByRole('navigation').getByText('Party Halls', { exact: false })).toBeVisible();

        // Check if hero action button exists
        await expect(page.getByRole('link', { name: /Browse Marketplace/i })).toBeVisible();
    });

    test('should navigate to browse page and switch categories', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /Browse Marketplace/i }).click();

        // Should be on /browse?category=restaurants by default or similar
        await expect(page).toHaveURL(/browse/);

        // Check category tabs
        const restaurantTab = page.getByRole('button', { name: /Restaurants/i });
        const nightlifeTab = page.getByRole('button', { name: /Nightlife/i });
        const hallsTab = page.getByRole('button', { name: /Party Halls/i });

        await expect(restaurantTab).toBeVisible();
        await expect(nightlifeTab).toBeVisible();
        await expect(hallsTab).toBeVisible();

        // Click on Nightlife and verify URL
        await nightlifeTab.click();
        await expect(page).toHaveURL(/category=clubs/);

        // Click on Party Halls and verify URL
        await hallsTab.click();
        await expect(page).toHaveURL(/category=halls/);
    });
});
