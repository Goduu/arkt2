import { test, expect } from '@playwright/test';
import { DesignPagePO } from './objects/DesignPagePO';


test('go to home', async ({ page }) => {
  await page.goto('localhost:3000/design');
  const designPage = new DesignPagePO(page);

  // Click the get started link.
  await designPage.breadcrumb.expectContains('Home');

});
