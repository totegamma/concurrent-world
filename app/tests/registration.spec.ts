import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.route(`https://www.googletagmanager.com/**`, (route) => {
        console.log('try to access:', route.request().url())
        route.abort()
    })
})

test('Registration is closed', async ({ page }) => {
    // Direct access to /register redirects to /welcome
    await page.goto('http://localhost:5173/register')
    await expect(page).toHaveURL(/\/welcome$/)

    // So does /invitation
    await page.goto('http://localhost:5173/invitation')
    await expect(page).toHaveURL(/\/welcome$/)

    // Welcome page guides to the v2 app stores instead of registration
    await expect(page.locator('a[href="/register"]')).toHaveCount(0)
    await expect(
        page.locator('a[href="https://apps.apple.com/jp/app/concrnt-world/id6757524249"]').first()
    ).toBeVisible()
    await expect(
        page.locator('a[href="https://play.google.com/store/apps/details?id=world.concrnt.app"]').first()
    ).toBeVisible()

    // Login is still available
    await expect(page.locator('a[href="/import"]').first()).toBeVisible()
})
