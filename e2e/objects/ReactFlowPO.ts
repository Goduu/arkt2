import { Page, Locator } from '@playwright/test';

export class ReactFlowPO {
  readonly page: Page;
  readonly root: Locator;
  readonly edges: Locator;
  readonly nodes: Locator;


  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('rf__wrapper');
    this.edges = this.root.locator('.react-flow__edge');
    this.nodes = this.root.locator('.react-flow__node');
  }

  async getNodeIdByLabel(label: string): Promise<string | null> {
    const labelLocator = this.root.getByTestId('arkt-node-label').filter({ hasText: label }).first();
    const node = labelLocator.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " react-flow__node ")]').first();
    return await node.getAttribute('data-id');
  }

}


