import { test, expect } from '@playwright/test';

test(`detect-crash`, async ({ page }) => {
    await page.goto(`http://localhost:5173/crash`);
    await page.waitForLoadState('networkidle');
    const errorButton = page.getByRole('button', { name: 'とりあえずリロード' })
    expect(errorButton).toHaveCount(1);
})


const guestTests = [
    {name: 'welcome', path: '/welcome'},
    {name: 'import', path: '/import'},
    {name: 'register', path: '/register'},
    {name: 'timeline', path: '/timeline/tar69vv26r5s4wk0r067v20bvyw@ariake.concrnt.net'},
    {name: 'profile by ccid', path: '/con1t0tey8uxhkqkd4wcp4hd4jedt7f0vfhk29xdd2'},
    {name: 'profile by handle', path: '/tote.gammalab.net'},
    {name: 'content by ccid', path: '/con1t0tey8uxhkqkd4wcp4hd4jedt7f0vfhk29xdd2/m6mzjwdcvexhbt52q068rhdatj8'},
    {name: 'content by handle', path: '/tote.gammalab.net/m6mzjwdcvexhbt52q068rhdatj8'},
]

guestTests.forEach((t) => {
    test(`smoke-guest-${t.name}`, async ({ page }) => {
        await page.goto(`http://localhost:5173${t.path}`);
        await page.waitForLoadState('networkidle');
        const errorButton = page.getByRole('button', { name: 'とりあえずリロード' })
        expect(errorButton).toHaveCount(0);
    });
})

const loggedinTests = [
    {name: 'home', path: '/'},
    {name: 'notifications', path: '/notifications'},
    {name: 'contacts', path: '/contacts'},
    {name: 'explorer-timelines', path: '/explorer/timelines'},
    {name: 'explorer-users', path: '/explorer/users'},
    {name: 'settings', path: '/settings'},
    {name: 'settings-general', path: '/settings/general'},
    {name: 'settings-profile', path: '/settings/profile'},
    {name: 'settings-identity', path: '/settings/identity'},
    {name: 'settings-theme', path: '/settings/theme'},
    {name: 'settings-sound', path: '/settings/sound'},
    {name: 'settings-emoji', path: '/settings/emoji'},
    {name: 'settings-media', path: '/settings/media'},
    {name: 'settings-loginqr', path: '/settings/loginqr'},
    {name: 'settings-inportexport-manage', path: '/settings/importexport/manage'},
    {name: 'settings-importexport-migrate', path: '/settings/importexport/migrate'},
    {name: 'settings-job', path: '/settings/job'},
    {name: 'subscriptions', path: '/subscriptions'},
    {name: 'timeline', path: '/timeline/tar69vv26r5s4wk0r067v20bvyw@ariake.concrnt.net'},
    {name: 'profile by ccid', path: '/con1t0tey8uxhkqkd4wcp4hd4jedt7f0vfhk29xdd2'},
    {name: 'profile by handle', path: '/tote.gammalab.net'},
    {name: 'content by ccid', path: '/con1t0tey8uxhkqkd4wcp4hd4jedt7f0vfhk29xdd2/m6mzjwdcvexhbt52q068rhdatj8'},
    {name: 'content by handle', path: '/tote.gammalab.net/m6mzjwdcvexhbt52q068rhdatj8'},
]

loggedinTests.forEach((t) => {
    test(`smoke-loggedin-${t.name}`, async ({ page }) => {
        // set localStorage
        await page.addInitScript(() => {
            // board aunt arm cushion install lyrics provide giraffe subway cart again arrow
            localStorage.setItem('PrivateKey', '"02b03c01d6fa12f23980dcb9bb61eb4c022f406515cbe8cab9527dc8c15430fd"');
            localStorage.setItem('Domain', '"zyouya.concrnt.net"');
        });

        await page.goto(`http://localhost:5173${t.path}`);
        await page.waitForLoadState('networkidle');
        const errorButton = page.getByRole('button', { name: 'とりあえずリロード' })
        expect(errorButton).toHaveCount(0);
    });
})

