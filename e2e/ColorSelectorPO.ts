import { TailwindFamily } from '@/components/colors/types';
import { Page, Locator } from '@playwright/test';

export class ColorSelectorPO {
  readonly page: Page;
  readonly root: Locator;
  readonly indicative: 'low' | 'high';

  constructor(page: Page, indicative: 'low' | 'high') {
    this.page = page;
    this.indicative = indicative;
    this.root = page.getByTestId(`color-selector-${indicative}`);
  }

  async selectColor(color: TailwindFamily) {
    await this.root.getByRole('button', { name: color }).click();
  }


}


