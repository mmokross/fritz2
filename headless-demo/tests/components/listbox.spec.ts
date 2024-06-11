import {expect, Locator, Page, test} from '@playwright/test';

/*
 * Missing tests due to limited example component:
 * - label
 * - validation
 * - positioning
 * - dynamic disabling
 * - external opening or closing
 */

test.beforeEach(async ({page}) => {
    await page.goto("#listbox");
    await expect(page.locator("#portal-root")).toBeAttached();
    await page.waitForTimeout(200);
});

test.describe('To open and close a listBox', () => {

    async function createLocators(page: Page): Promise<[Locator, Locator]> {
        const btn = page.locator("#starwars-button")
        const listBoxItems = page.locator("#starwars-items")
        return [btn, listBoxItems]
    }

    async function assertListBoxIsOpen(btn: Locator, popupRoot: Locator) {
        await expect(popupRoot).toBeVisible();
        await expect(btn).toHaveAttribute("aria-expanded", "true")
    }

    async function assertListBoxIsClosed(btn: Locator, popupRoot: Locator) {
        await expect(popupRoot).toBeHidden();
        await expect(btn).toHaveAttribute("aria-expanded", "false")
    }

    test('click twice on the listBoxButton', async ({page}) => {
        const [btn, listBoxItems] = await createLocators(page)

        await btn.focus()
        await assertListBoxIsClosed(btn, listBoxItems)

        await btn.click();
        await assertListBoxIsOpen(btn, listBoxItems)

        await btn.click();
        await assertListBoxIsClosed(btn, listBoxItems)
    });

    test('click on the listBoxButton first and then click outside of the listBoxItems', async ({page}) => {
        const [btn, listBoxItems] = await createLocators(page)

        await btn.focus()
        await assertListBoxIsClosed(btn, listBoxItems)

        await btn.click();
        await assertListBoxIsOpen(btn, listBoxItems)

        await page.mouse.click(0, 0)
        await assertListBoxIsClosed(btn, listBoxItems)
    });

    for (const key of ["Enter", "Space"]) {
        test(`focus the listBoxButton and press ${key} then press Escape`, async ({page}) => {
            const [btn, listBoxItems] = await createLocators(page)

            await btn.focus()
            await assertListBoxIsClosed(btn, listBoxItems)

            await page.press("#starwars-button", key)
            await assertListBoxIsOpen(btn, listBoxItems)

            await page.press("#starwars-items", "Escape")
            await assertListBoxIsClosed(btn, listBoxItems)
        });
    }

    test('and check if data-listbox-active of item is true', async ({page}) => {
        async function assertItemIsActive(itemId: string) {
            await expect(listBoxItems).toHaveAttribute("aria-activedescendant", itemId)
            await expect(page.locator("#" + itemId)).toHaveAttribute("data-listbox-active", "true")
            await expect(page.locator("#" + itemId)).toHaveAttribute("data-listbox-selected", "false")
        }

        const [btn, listBoxItems] = await createLocators(page)

        await btn.focus()
        await assertListBoxIsClosed(btn, listBoxItems)

        await btn.click();
        await assertListBoxIsOpen(btn, listBoxItems)

        const item4 = page.locator("#starwars-item-4")
        const item = await item4.boundingBox()

        await page.mouse.move(item.x + item.width / 2, item.y + item.height / 2)
        await assertItemIsActive("starwars-item-4")
    });

});

test.describe("Navigating", () => {
    test("through the items should work by Arrow keys", async ({page}) => {

        const btn = page.locator("#starwars-button")
        const listBoxItems = page.locator("#starwars-items")
        await btn.click()
        await expect(listBoxItems).toBeFocused()

        async function assertItemIsActive(itemId: string) {
            await expect(listBoxItems).toHaveAttribute("aria-activedescendant", itemId)
            await expect(page.locator("#" + itemId)).toHaveAttribute("data-listbox-active", "true")
            await expect(page.locator("#" + itemId)).toHaveAttribute("data-listbox-selected", "false")
        }

        /* down */
        await listBoxItems.press("ArrowDown")
        await assertItemIsActive("starwars-item-1")

        await listBoxItems.press("ArrowDown")
        await assertItemIsActive("starwars-item-2")

        await listBoxItems.press("ArrowDown")
        await assertItemIsActive("starwars-item-3")

        /* up */
        await listBoxItems.press("ArrowUp")
        await assertItemIsActive("starwars-item-2")

        await listBoxItems.press("ArrowUp")
        await assertItemIsActive("starwars-item-1")
    });

    test("by Arrow Keys will jump over disabled items", async ({page}) => {
        const btn = page.locator("#starwars-button")
        const listBoxItems = page.locator("#starwars-items")
        await btn.click()
        await expect(listBoxItems).toBeFocused()

        const startingItem = page.locator("#starwars-item-4")
        const bypassedItem = page.locator("#starwars-item-5")
        const targetItem = page.locator("#starwars-item-6")

        await startingItem.hover()
        await expect(startingItem).toHaveAttribute("data-listbox-selected", "false")

        /* down */
        await listBoxItems.press("ArrowDown")
        await expect(listBoxItems).toHaveAttribute("aria-activedescendant", "starwars-item-6")
        await expect(startingItem).toHaveAttribute("data-listbox-active", "false")
        await expect(startingItem).toHaveAttribute("data-listbox-selected", "false")
        await expect(bypassedItem).toHaveAttribute("data-listbox-active", "false")
        await expect(bypassedItem).toHaveAttribute("data-listbox-selected", "false")
        await expect(targetItem).toHaveAttribute("data-listbox-active", "true")
        await expect(targetItem).toHaveAttribute("data-listbox-selected", "false")

        /* up */
        await listBoxItems.press("ArrowUp")
        await expect(listBoxItems).toHaveAttribute("aria-activedescendant", "starwars-item-4")
        await expect(startingItem).toHaveAttribute("data-listbox-active", "true")
        await expect(startingItem).toHaveAttribute("data-listbox-selected", "false")
        await expect(bypassedItem).toHaveAttribute("data-listbox-active", "false")
        await expect(bypassedItem).toHaveAttribute("data-listbox-selected", "false")
        await expect(targetItem).toHaveAttribute("data-listbox-active", "false")
        await expect(targetItem).toHaveAttribute("data-listbox-selected", "false")
    });

    for (const data of [
        {key: "l", expected: "1"},
        {key: "c", expected: "2"},
        {key: "h", expected: "3"},
        {key: "v", expected: "6"},
        {key: "t", expected: "7"}
    ]) {
        test(`by starting character "${data.key}" will jump to first appearance of item`, async ({page}) => {
            const btn = page.locator("#starwars-button")
            const listBoxItems = page.locator("#starwars-items")
            const itemId = `starwars-item-${data.expected}`
            await btn.click()
            await expect(listBoxItems).toBeFocused()

            await listBoxItems.press(data.key)
            await expect(listBoxItems).toHaveAttribute("aria-activedescendant", itemId)
            const item = page.locator("#" + itemId)
            await expect(item).toHaveAttribute("data-listbox-active", "true")
            await expect(item).toHaveAttribute("data-listbox-selected", "false")
        });
    }

    for (const data of [
        {shortcut: "Home", target: "first", id: "1"},
        {shortcut: "End", target: "last", id: "7"}
    ]) {
        test(`by pressing "${data.shortcut}" will jump to ${data.target} item`, async ({page}) => {
            const btn = page.locator("#starwars-button")
            const listBoxItems = page.locator("#starwars-items")
            const itemId = `starwars-item-${data.id}`
            await btn.click()
            await expect(listBoxItems).toBeFocused()

            await listBoxItems.press(data.shortcut)
            await expect(listBoxItems).toHaveAttribute("aria-activedescendant", itemId)
            const item = page.locator("#" + itemId)
            await expect(item).toHaveAttribute("data-listbox-active", "true")
            await expect(item).toHaveAttribute("data-listbox-selected", "false")
        });
    }
});

test.describe("To select an item from a listBox open the listBoxItems", () => {
    test("then click on one item", async ({page}) => {
        const btn = page.locator("#starwars-button")
        const listBoxItems = page.locator("#starwars-items")
        const result = page.locator('#result')
        await expect(btn).toHaveText("Luke")

        await btn.click()
        const item = page.locator("#starwars-item-3")
        await expect(item).toHaveAttribute("data-listbox-selected", "false")
        await item.click()
        await expect(item).toHaveAttribute("data-listbox-selected", "true")
        await expect(result).toContainText(await item.textContent())

        await expect(item).toHaveAttribute("data-listbox-active", "true")
        await expect(btn).toHaveText("Han")
        await expect(listBoxItems).toHaveAttribute("aria-activedescendant", "starwars-item-3")
    });

    [
        {
            name: 'click on item', selectAction: async (item: Locator) => {
                await item.click()
            }
        },
        {
            name: 'pressing Enter', selectAction: async (item: Locator) => {
                await item.hover()
                await item.press("Enter")
            }
        },
        {
            name: 'presssing Space', selectAction: async (item: Locator) => {
                await item.hover()
                await item.press("Space")
            }
        },
    ].forEach(({name, selectAction}) => {
        test(`and select the same item twice by ${name} will close the listBox`, async ({page}) => {
            const listBoxItems = page.locator("#starwars-items")
            const result = page.locator('#result')
            const han = listBoxItems.getByText("Han")

            // first selection
            await page.getByRole("button", {name: "Luke"}).click()
            await expect(listBoxItems).toBeVisible()
            await selectAction(han)
            await expect(listBoxItems).toBeHidden()
            await expect(result).toContainText("Han")

            // second selection
            await page.getByRole("button", {name: "Han"}).click()
            await expect(listBoxItems).toBeVisible()
            await selectAction(han)
            await expect(listBoxItems).toBeHidden()
            await expect(result).toContainText("Han")
        })
    })

    for (const key of ["Enter", "Space"]) {
        test(`then press ${key}`, async ({page}) => {
            const btn = page.locator("#starwars-button")
            const listBoxItems = page.locator("#starwars-items")
            const result = page.locator('#result')
            await expect(btn).toHaveText("Luke")

            await btn.click()
            const item = page.locator("#starwars-item-3")
            await expect(item).toHaveAttribute("data-listbox-active", "false")
            await item.hover()
            await expect(item).toHaveAttribute("data-listbox-active", "true")
            await expect(item).toHaveAttribute("data-listbox-selected", "false")
            await page.press("#starwars-item-3", key)
            await expect(item).toHaveAttribute("data-listbox-selected", "true")
            await expect(result).toContainText(await item.textContent())

            await expect(btn).toHaveText("Han")
            await expect(listBoxItems).toHaveAttribute("aria-activedescendant", "starwars-item-3")
        });
    }
});