import { Page, Locator } from '@playwright/test';
import { ArktNodePO } from './ArktNodePO';

export class ArktEdgePO {
  readonly page: Page;
  readonly root: Locator;
  readonly label: Locator;
  readonly id: string;
  readonly labelInput: Locator;


  private constructor(page: Page, root: Locator, id: string) {
    this.page = page;
    this.root = root;
    this.id = id;
    this.label = this.root.getByTestId(`edge-label-${id}`);
    this.labelInput = this.label.getByTestId(`text-inline-input`);
  }

  static async create(page: Page, sourceNode: ArktNodePO, targetNode: ArktNodePO): Promise<ArktEdgePO> {
    const root = page.getByTestId(`edge-${sourceNode.id}-${targetNode.id}`).first();
    const resolvedId = await root.getAttribute('id') || "";
    return new ArktEdgePO(page, root, resolvedId);
  }

  async drillUpTo(label: string): Promise<void> {
    await this.root.getByTestId(`breadcrumb-link-${label}`).click();
  }

}


