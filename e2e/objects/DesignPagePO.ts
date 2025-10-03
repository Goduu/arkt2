import { Page, Locator, expect } from '@playwright/test';
import { BreadcrumbPO } from './BreadcrumbPO';
import { SidenavPO } from './SidenavPO';
import { ArktNodePO } from './ArktNodePO';
import { ReactFlowPO } from './ReactFlowPO';
import { TemplateDialogPO } from './TemplateDialogPO';

export class DesignPagePO {
  readonly page: Page;
  readonly root: Locator;
  readonly breadcrumb: BreadcrumbPO;
  readonly sidenav: SidenavPO;
  readonly reactFlowCanvas: ReactFlowPO;
  readonly templateDialog: TemplateDialogPO;


  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('design-page');
    this.breadcrumb = new BreadcrumbPO(page);
    this.sidenav = new SidenavPO(page);
    this.reactFlowCanvas = new ReactFlowPO(page);
    this.templateDialog = new TemplateDialogPO(page);
  }

  createArktNodePOById(dataId: string): ArktNodePO {
    return ArktNodePO.fromId(this.page, dataId);
  }

  async createArktNode(label?: string): Promise<ArktNodePO> {
    await this.sidenav.addNode.click();
    const box = await this.reactFlowCanvas.root.boundingBox();
    if (!box) throw new Error('React Flow canvas not found');
    await this.page.mouse.click(box.x + 200, box.y + 200);

    const nodeId = await this.reactFlowCanvas.getNodeIdByLabel("New Node")
    await expect(nodeId).toBeTruthy()
    if (!nodeId) throw new Error('Newly created node did not expose a data-id');

    const node = new ArktNodePO(this.page, nodeId);

    if (label) {
      await node.fillLabel(label);
    }

    return node;
  }

}


