import { test, expect } from '@playwright/test';
import { DesignPagePO } from './objects/DesignPagePO';


test('arkt node drill down and breadcrumb navigation', async ({ page }) => {
  await page.goto('localhost:3000/design');
  const designPage = new DesignPagePO(page);

  // Click the get started link.
  await designPage.breadcrumb.expectContains('Home');
  await designPage.createArktNode();

  const parentNode = await designPage.createArktNode("My Node");
  const parentNodeLabel = await parentNode.label.textContent();
  expect(parentNodeLabel).toBeTruthy();

  await parentNode.drillDown();
  await designPage.breadcrumb.expectContains('Home');
  await designPage.breadcrumb.expectExactLast(parentNodeLabel!);

  const childNode = await designPage.createArktNode("My Child Node");
  const childNodeLabel = await childNode.label.textContent();
  expect(childNodeLabel).toBeTruthy();

  await childNode.drillDown();
  await designPage.breadcrumb.expectContains('Home');
  await designPage.breadcrumb.expectContains(parentNodeLabel!);
  await designPage.breadcrumb.expectExactLast(childNodeLabel!);

  // DRILL UP 
  await designPage.breadcrumb.drillUpTo(parentNodeLabel!);
  await designPage.breadcrumb.expectContains('Home');
  await designPage.breadcrumb.expectExactLast(parentNodeLabel!);

  await designPage.breadcrumb.drillUpTo("Home");
  await designPage.breadcrumb.expectContains('Home');
  await designPage.breadcrumb.expectExactLast("Home");

});

test('arkt node controls', async ({ page }) => {
  await page.goto('localhost:3000/design');
  const designPage = new DesignPagePO(page);
  const node = await designPage.createArktNode("My Node");
  await node.root.click();

  const controls = node.controls;
  await controls.arktFields.description.click();
  await controls.arktFields.description.fill('This is a description');
  await expect(controls.arktFields.description).toHaveValue('This is a description');
  await node.selectFontSize(15);
  await expect(node.label).toHaveCSS('font-size', '15px');
  await node.selectFontSize(10);
  await expect(node.label).toHaveCSS('font-size', '10px');
  await controls.arktFields.fillColor.selectColor('blue');
  await controls.arktFields.strokeColor.selectColor('blue');
  // TODO: check how to get the stroke color
  // await expect(node.root).toHaveCSS('stroke', '#1d4ed8');
  // await expect(node.root).toHaveCSS('stroke', '#93c5fd');
});
