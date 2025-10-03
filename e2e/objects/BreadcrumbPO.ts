import { Page, Locator, expect } from '@playwright/test';

export class BreadcrumbPO {
  readonly page: Page;
  readonly root: Locator;
  readonly list: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('breadcrumb');
    this.list = page.getByTestId('breadcrumb-list');
  }

  async drillUpTo(label: string): Promise<void> {
    await this.list.getByTestId(`breadcrumb-link-${label}`).click();
  }

  async expectContains(label: string) {
    await expect(this.list).toContainText(label);
  }

  async expectExactLast(label: string) {
    const lastItem = this.list.locator('li').last();
    await expect(lastItem).toContainText(label);
  }

  async expectNotContains(label: string) {
    await expect(this.list).not.toContainText(label);
  }

  async getPathText(): Promise<string> {
    return (await this.list.innerText()).trim();
  }
}


