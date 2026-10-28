import { test, expect } from '@playwright/test';

test('home loads', async ({ page }) => {
  await page.goto('https://escaladigital-two.vercel.app');
  await expect(page).toHaveTitle(/Escala Digital/);
});

test('auth page loads', async ({ page }) => {
  await page.goto('https://escala-digital-app.vercel.app/auth');
  await expect(page.locator('form')).toBeVisible();
});

test('dashboard route no 404', async ({ page }) => {
  const res = await page.goto('https://escala-digital-app.vercel.app/dashboard');
  expect(res?.status()).not.toBe(404);
});
