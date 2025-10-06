import { Page, Locator, expect } from '@playwright/test';

export class SidenavPO {
  readonly page: Page;
  readonly root: Locator;
  readonly list: Locator;
  readonly home: Locator;
  readonly templates: Locator;
  readonly settings: Locator;
  readonly addText: Locator;
  readonly addLine: Locator;
  readonly addNode: Locator;
  readonly addVirtualNode: Locator;
  readonly addIntegrationNode: Locator;
  readonly createTemplate: Locator;
  readonly openResetDialog: Locator;
  readonly modeToggle: Locator;
  readonly modeToggleLight: Locator;
  readonly modeToggleDark: Locator;
  readonly modeToggleSystem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('sidenav');
    this.list = this.root;

    // Main navigation
    this.home = this.root.getByTestId('home');
    this.templates = this.root.getByTestId('open-templates-manager');
    this.settings = this.root.getByTestId('open-settings');

    // Add section
    this.addText = this.root.getByTestId('add-text');
    this.addLine = this.root.getByTestId('add-line');
    this.addNode = this.root.getByTestId('add-node');
    this.addVirtualNode = this.root.getByTestId('add-virtual-node');
    this.addIntegrationNode = this.root.getByTestId('add-integration-node');

    // Templates action (exists in two places; pick the first occurrence)
    this.createTemplate = this.root.getByTestId('create-template').first();
    this.openResetDialog = this.root.getByTestId('open-reset-dialog');

    // Mode toggle
    this.modeToggle = this.root.getByTestId('mode-toggle');
    this.modeToggleLight = this.root.getByTestId('mode-toggle-light');
    this.modeToggleDark = this.root.getByTestId('mode-toggle-dark');
    this.modeToggleSystem = this.root.getByTestId('mode-toggle-system');
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

  async getTemplateButton(name: string): Promise<Locator> {
    return this.root.getByTestId(`template-icon-${name}`);
  }
}


