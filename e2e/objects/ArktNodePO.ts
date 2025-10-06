import { FONT_SIZES } from '@/components/controls/FontSizeSelector';
import { Page, Locator, expect } from '@playwright/test';
import { ControlsPO } from './ControlsPO';

export class ArktNodePO {
  readonly page: Page;
  readonly root: Locator;
  readonly label: Locator;
  readonly labelEdit: Locator;
  readonly handlers: {
    top: Locator;
    bottom: Locator;
    left: Locator;
    right: Locator;
  }
  readonly controls: ControlsPO

  constructor(page: Page, id: string) {
    this.page = page;
    this.root = page.locator(`[data-id="${id}"]`)
    this.label = this.root.getByTestId('arkt-node-label');
    this.labelEdit = this.root.getByTestId('arkt-node-label-edit');
    this.handlers = {
      top: this.root.getByTestId('handler-top'),
      bottom: this.root.getByTestId('handler-bottom'),
      left: this.root.getByTestId('handler-left'),
      right: this.root.getByTestId('handler-right'),
    }
    this.controls = new ControlsPO(page);
  }

  async createEdgeTo(node: ArktNodePO, startDirection: 'right' | 'left' | 'top' | 'bottom'): Promise<void> {
    const srcBox = await this.handlers[startDirection].boundingBox();
    const destDirection = startDirection === 'right' ? 'left' : startDirection === 'left' ? 'right' : startDirection === 'top' ? 'bottom' : 'top';
    const dstRootBox = await node.root.boundingBox();
    const dstHandleBox = await node.handlers[destDirection].boundingBox();
    if (!srcBox || !dstRootBox || !dstHandleBox) throw new Error('Failed to resolve bounding boxes for drag');

    await this.page.mouse.move(srcBox.x + srcBox.width / 2, srcBox.y + srcBox.height / 2);
    await this.page.mouse.down();

    // Move over node2 to trigger hover state so the left handler becomes fully visible
    await this.page.mouse.move(dstRootBox.x + dstRootBox.width / 2, dstRootBox.y + dstRootBox.height / 2);
    await expect(node.handlers[destDirection]).toBeVisible();

    // Now move precisely to the left handler and drop
    await this.page.mouse.move(dstHandleBox.x + dstHandleBox.width / 2, dstHandleBox.y + dstHandleBox.height / 2);
    await this.page.mouse.up();
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


