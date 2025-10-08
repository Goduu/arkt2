import { ICONS } from '@/lib/icons/iconRegistry';
import { Page, Locator } from '@playwright/test';
import { ColorSelectorPO } from './ColorSelectorPO';
import { TailwindFamily } from '@/components/colors/types';
import { IconSelectorPO } from './IconSelectorPO';

export class TemplateDialogPO {
    readonly page: Page;
    readonly root: Locator;
    readonly buttons: {
        cancel: Locator;
        save: Locator;
        create: Locator;
    }
    readonly fields: {
        name: Locator;
        description: Locator;
        fillColor: ColorSelectorPO;
        strokeColor: ColorSelectorPO;
        iconKey: IconSelectorPO;
    }

    constructor(page: Page) {
        this.page = page;
        this.root = page.getByTestId('create-template-dialog');
        this.buttons = {
            cancel: this.root.getByTestId('template-dialog-cancel'),
            save: this.root.getByTestId('template-dialog-save'),
            create: this.root.getByTestId('template-dialog-create'),
        }
        this.fields = {
            name: this.root.getByTestId('create-template-dialog-name'),
            description: this.root.getByTestId('create-template-dialog-description'),
            iconKey: new IconSelectorPO(page),
            fillColor: new ColorSelectorPO(page, 'low'),
            strokeColor: new ColorSelectorPO(page, 'high'),
        }

    }

    async selectIcon(iconKey: (typeof ICONS)[number]['key']) {
        await this.fields.iconKey.selectQuickIcon(iconKey);
    }

    async fillName(name: string) {
        await this.fields.name.click();
        await this.fields.name.fill(name);
    }
    async fillDescription(description: string) {
        await this.fields.description.click();
        await this.fields.description.fill(description);
    }
    async fillFillColor(fillColor: TailwindFamily) {
        await this.fields.fillColor.selectColor(fillColor);
    }

    async fillStrokeColor(strokeColor: TailwindFamily) {
        await this.fields.strokeColor.selectColor(strokeColor);
    }

}


