import { FONT_SIZES } from '@/components/controls/FontSizeSelector';
import { Page, Locator, expect } from '@playwright/test';
import { ControlsPO } from './ControlsPO';

export class ArktNodePO {
  readonly page: Page;
  readonly root: Locator;
  readonly label: Locator;
  readonly labelEdit: Locator;
  readonly controls: ControlsPO

  constructor(page: Page, id: string) {
    this.page = page;
    this.root = page.locator(`[data-id="${id}"]`)
    this.label = this.root.getByTestId('arkt-node-label');
    this.labelEdit = this.root.getByTestId('arkt-node-label-edit');
    this.controls = new ControlsPO(page);
  }

  static fromId(page: Page, dataId: string): ArktNodePO {
    return new ArktNodePO(page, dataId);
  }

  async drillDown(): Promise<void> {
    await this.root.click({ modifiers: ['Alt'] });
  }

  async fillLabel(label: string): Promise<void> {
    await this.label.dblclick();
    await expect(this.labelEdit).toBeVisible();
    await this.labelEdit.fill(label);
    await this.labelEdit.press('Escape');
    await expect(this.label).toHaveText(label);
  }

  async selectFontSize(size: (typeof FONT_SIZES)[number]['size']): Promise<void> {
    await this.controls.arktFields.fontSize.getByRole('button', { name: `font-size-${size}` }).click();
  }

}


