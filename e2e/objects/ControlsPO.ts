import { Page, Locator } from '@playwright/test';
import { ColorSelectorPO } from './ColorSelectorPO';

export class ControlsPO {
    readonly page: Page;
    readonly root: Locator;
    readonly arktFields: {
        description: Locator;
        fontSize: Locator;
        fillColor: ColorSelectorPO;
        strokeColor: ColorSelectorPO;
    }

    constructor(page: Page) {
        this.page = page;
        this.root = page.getByTestId('node-controls');
        this.arktFields = {
            description: this.root.getByTestId('basic-controls-description').getByRole('textbox'),
            fontSize: this.root.getByTestId('font-size-selector'),
            fillColor: new ColorSelectorPO(page, 'low'),
            strokeColor: new ColorSelectorPO(page, 'high'),
        }
    }

}


