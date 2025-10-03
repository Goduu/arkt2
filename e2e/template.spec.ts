import test, { expect } from "@playwright/test";
import { DesignPagePO } from "./objects/DesignPagePO";


test('create template', async ({ page }) => {
    await page.goto('localhost:3000/design');
    const designPage = new DesignPagePO(page);
    await designPage.sidenav.createTemplate.click();

    await designPage.templateDialog.fillName('Template1');
    await expect(designPage.templateDialog.fields.name).toHaveValue('Template1');
    await designPage.templateDialog.fillDescription('This is a template');
    await expect(designPage.templateDialog.fields.description).toHaveValue('This is a template');
    await designPage.templateDialog.fillFillColor('green');
    await designPage.templateDialog.fillStrokeColor('green');
    await designPage.templateDialog.selectIcon('activity');
    await designPage.templateDialog.buttons.create.click();
});