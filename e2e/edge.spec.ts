import { expect, test } from '@playwright/test';
import { DesignPagePO } from './objects/DesignPagePO';


test('create two nodes and connect them', async ({ page }) => {
  await page.goto('localhost:3000/design');
  const designPage = new DesignPagePO(page);

  const node1 = await designPage.createArktNode("My Node");
  const node2 = await designPage.createArktNode("Other Node", 600);

  const edge = await node1.createEdgeTo(node2, 'right');

  await expect(edge.id).toBeTruthy();

  await edge.label.dblclick();
  await expect(edge.labelInput).toBeVisible();
  await edge.labelInput.fill("My Edge");
  await edge.labelInput.press('Escape');
  await expect(edge.label).toHaveText("My Edge");
});

