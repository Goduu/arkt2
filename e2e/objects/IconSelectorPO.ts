import { IconKey } from '@/lib/icons/iconRegistry';
import { Page, Locator } from '@playwright/test';

export class IconSelectorPO {
    readonly page: Page;
    readonly root: Locator;

    constructor(page: Page) {
        this.page = page;
        this.root = page.getByTestId('icon-selector');
    }

    async selectQuickIcon(key: IconKey): Promise<void> {
        await this.root.getByTestId(`icon-selector-key-${key}`).click();
    }

}


