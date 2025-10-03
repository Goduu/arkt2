import { Page, Locator, expect } from '@playwright/test';

export class BreadcrumbPO {
  readonly page: Page;
  readonly root: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('breadcrumb');
  }

  async drillUpTo(label: string): Promise<void> {
    await this.root.getByTestId(`breadcrumb-link-${label}`).click();
  }

}


