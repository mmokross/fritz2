import {expect, test} from '@playwright/test';

/*
 * Missing tests due to limited example component:
 * - styling
 */

//declare here all our before hooks
test.beforeEach(async ({page}) => {
    //go to the page of CheckBoxGroup component
    await page.goto("https://next.fritz2.dev/headless-demo/#dataCollection");
    //await page.goto("file:///C:/Users/bfong/Downloads/distributions/distributions/index.html#dataCollection");
//end of before hooks
});

// TESTS FOR DATATABLE

//description of our first tests
test.describe('To select', () => {
    //description of the first test
    test('unique element of Datatable through click', async ({page, browserName}) => {
        test.slow(browserName === 'webkit', 'This test for DataCollection is slow on Mac');
        //locator for some names from the table
        const selected1 = page.locator('id=Hansgeorg Kranz');
        const selectedText1 = await selected1.locator('xpath=//td[1]').textContent();
        const selected2 = page.locator('id=Sigrun Kensy B.Eng.');
        const selectedText2 = await selected2.locator('xpath=//td[1]').textContent();
        const nameDiv = page.locator('id=Carl Zänker');
        const name = await nameDiv.locator('xpath=//td[1]').textContent();
        const result = page.locator('#result');
        //first assertions
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText([selectedText1, selectedText2])
        //mouse over on nameDiv element
        await page.mouse.click(0,0,{delay:2000})
        await nameDiv.scrollIntoViewIfNeeded()
        const namebox = await nameDiv.boundingBox()
        await page.mouse.move(namebox.x + namebox.width / 2, namebox.y + namebox.height / 2, {steps: 5});
        //verify attributes
        await expect(nameDiv).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv).toHaveAttribute("data-datatable-selected", "false")
        //click on nameDiv element
        await nameDiv.click({delay: 1000})
        //await page.mouse.click(namebox.x + namebox.width / 2, namebox.y + namebox.height / 2);
        //verify new attributes
        await expect(nameDiv).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv).toHaveAttribute("data-datatable-selected", "true")
        await expect(result).toContainText([selectedText1, selectedText2, name])
    //end of first test
    });
    //description of the second test
    test('several elements of Datatable through click', async ({page, browserName}) => {
        test.slow(browserName === 'webkit', 'This test for DataCollection is slow on Mac');
        //locator for some names from the table
        const selected1 = page.locator('id=Hansgeorg Kranz');
        const selectedText1 = await selected1.locator('xpath=//td[1]').textContent();
        const selected2 = page.locator('id=Sigrun Kensy B.Eng.');
        const selectedText2 = await selected2.locator('xpath=//td[1]').textContent();
        const nameDiv1 = page.locator('id=Carl Zänker');
        const name1 = await nameDiv1.locator('xpath=//td[1]').textContent();
        const nameDiv2 = page.locator('id=Salih Ernst B.A.');
        const name2 = await nameDiv2.locator('xpath=//td[1]').textContent();
        const nameDiv3 = page.locator('id=Orhan Schacht-Gröttner');
        const name3 = await nameDiv3.locator('xpath=//td[1]').textContent();
        const result = page.locator('#result');
        //first assertions
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText([selectedText1, selectedText2])
        //mouse over on nameDiv1 element
        await page.mouse.click(0,0,{delay:2000})
        await nameDiv1.scrollIntoViewIfNeeded()
        const namebox1 = await nameDiv1.boundingBox()
        await page.mouse.move(namebox1.x + namebox1.width / 2, namebox1.y + namebox1.height / 2, {steps: 5});
        //verify attributes
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "false")
        //click on nameDiv1
        await nameDiv1.click({delay: 2000})
        //verify attributes and result
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(result).toContainText([selectedText1, selectedText2, name1])
        //mouse over on nameDiv2 element
        await page.mouse.click(0,0,{delay:2000})
        await nameDiv2.scrollIntoViewIfNeeded()
        const namebox2 = await nameDiv2.boundingBox()
        await page.mouse.move(namebox2.x + namebox2.width / 2, namebox2.y + namebox2.height / 2, {steps: 5});
        //verify attributes
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "false")
        //click on nameDiv2
        await nameDiv2.click({delay: 2000})
        //verify attributes and result
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "true")
        await expect(result).toContainText([selectedText1, selectedText2, name1, name2])
        //mouse over on nameDiv3 element
        await page.mouse.click(0,0,{delay:2000})
        await nameDiv3.scrollIntoViewIfNeeded()
        const namebox3 = await nameDiv3.boundingBox()
        await page.mouse.move(namebox3.x + namebox3.width / 2, namebox3.y + namebox3.height / 2, {steps: 5});
        //verify attributes
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv3).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv3).toHaveAttribute("data-datatable-selected", "false")
        //click on nameDiv3
        await nameDiv3.click({delay: 2000})
        //verify attributes and result
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv3).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv3).toHaveAttribute("data-datatable-selected", "true")
        await expect(result).toContainText([selectedText1, selectedText2, name1, name2, name3])
    //end of second test
    });
//end of our first tests
});
//description of our second tests
test.describe('Navigating', () => {
    //description of the first test
    for (const key of ["Enter", "Space"]) {
    test(`with Arrow keys through the items of Datatable and selects with ${key}`, async ({page, browserName}) => {
        test.slow(browserName === 'webkit', 'This test for DataCollection is slow on Mac');
        //locator for some names from the table
        const selected1 = page.locator('id=Hansgeorg Kranz');
        const selectedText1 = await selected1.locator('xpath=//td[1]').textContent();
        const selected2 = page.locator('id=Sigrun Kensy B.Eng.');
        const selectedText2 = await selected2.locator('xpath=//td[1]').textContent();
        const nameDiv1 = page.locator('id=Prof. Alberto Kraushaar B.A.');
        const name1 = await nameDiv1.locator('xpath=//td[1]').textContent();
        const nameDiv2 = page.locator('id=Monique Riehl');
        const name2 = await nameDiv2.locator('xpath=//td[1]').textContent();
        const result = page.locator('#result');
        //first assertions
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText([selectedText1, selectedText2])
        //click on nameDiv element
        await page.mouse.click(0,0,{delay:2000})
        const selectedBox2 = await selected2.boundingBox()
        await page.mouse.move(selectedBox2.x + selectedBox2.width / 2, selectedBox2.y + selectedBox2.height / 2, {steps: 5});
        await page.mouse.click(selectedBox2.x + selectedBox2.width / 2, selectedBox2.y + selectedBox2.height / 2,{delay:2000});
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "true")
        await expect(result).toContainText(selectedText1)
        //press "Down" on element
        await selected2.press('ArrowDown', {delay: 2000})
        //verify attributes
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")
        //press "Enter"/"Space" on element
        await nameDiv1.press(key, {delay:2000})
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")
        await expect(result).toContainText([selectedText1, name1])
        //press "Down" on element
        await nameDiv1.press('ArrowDown', {delay: 2000})
        //verify attributes
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "true")
        //press "Enter"/"Space" on element
        await nameDiv2.press(key, {delay: 2000})
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "true")
        await expect(result).toContainText([selectedText1, name1, name2])
        //press "Enter"/"Space" on element
        await nameDiv2.press(key, {delay: 2000})
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "true")
        await expect(result).toContainText([selectedText1, name1])
        //press "Up" on element
        await nameDiv2.press('ArrowUp', {delay: 2000})
        //verify attributes
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "false")
        //press "Enter"/"Space" on element
        await nameDiv1.press(key, {delay: 2000})
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText(selectedText1)
        //press "Up" on element
        await nameDiv1.press('ArrowUp', {delay: 2000})
        //verify attributes
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "false")

    });
    }

    //description of the second test
    test('through first and last element of Datatable with keys', async ({page, browserName}) => {
        test.slow(browserName === 'webkit', 'This test for DataCollection is slow on Mac');
        //locator for some names from the table
        const selected1 = page.locator('id=Hansgeorg Kranz');
        const selectedText1 = await selected1.locator('xpath=//td[1]').textContent();
        const selected2 = page.locator('id=Sigrun Kensy B.Eng.');
        const selectedText2 = await selected2.locator('xpath=//td[1]').textContent();
        const nameDiv = page.locator('id=Dr. Igor Steckel MBA.');
        const name = await nameDiv.locator('xpath=//td[1]').textContent();
        const result = page.locator('#result');
        //first assertions
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText([selectedText1, selectedText2])
        //click on first name
        await page.mouse.click(0,0,{delay:2000})
        const selectedBox1 = await selected1.boundingBox()
        await page.mouse.move(selectedBox1.x + selectedBox1.width / 2, selectedBox1.y + selectedBox1.height / 2, {steps: 5});
        await page.mouse.click(selectedBox1.x + selectedBox1.width / 2, selectedBox1.y + selectedBox1.height / 2, {delay:2500});
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected1).toHaveAttribute("data-datatable-active", "true")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText(selectedText2)
        //click on second name
        const selectedBox2 = await selected2.boundingBox()
        await page.mouse.move(selectedBox2.x + selectedBox2.width / 2, selectedBox2.y + selectedBox2.height / 2, {steps: 5});
        await page.mouse.click(selectedBox2.x + selectedBox2.width / 2, selectedBox2.y + selectedBox2.height / 2, {delay:2500});
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "true")
        await expect(result).not.toContainText(selectedText2)
        //press "Home" on second name will jump to first name
        await selected2.press('Home', {delay: 2000})
        //press "Enter" on first name
        await selected1.press('Enter', {delay: 2000})
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "true")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText(selectedText1)
        //press "End" on first name will jump to last name
        await selected1.press('End', {delay: 2000})
        //press "Space" on first name
        await nameDiv.press('Enter', {delay: 2000})
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv).toHaveAttribute("data-datatable-active", "true")
        await expect(result).toContainText([selectedText1, name])
    //end of second test
    });
//end of our second tests
});

//description of our third tests
test.describe('To', () => {
    //description of the first test
    test('filter some elements of Datatable', async ({page}) => {
        //locator for filter field and table body
        const filterField = page.locator('#dataTable-filter-field');
        const table = page.locator('id=dataTable >> tbody')
        //fill "Kranz" in filter field
        await filterField.fill("Kranz")
        //click away the field
        await page.mouse.click(0, 0, {delay:2000})
        //number of elements in table after filter
        const tableCount1 = await table.locator('xpath=//tr').count()
        //result after filter
        const resultCtn1 = (await page.locator('id=result >> em').textContent()).replace('Selected (2/','').replace('):','');
        const resultCount1 = parseInt(resultCtn1);
        //compare both table count and result
        expect(resultCount1).toEqual(tableCount1);

        //fill "Timm" in filter field
        await filterField.fill("Timm")
        //press "Enter" on field
        await filterField.press('Enter', {delay: 2000})
        //number of elements in table after filter
        const tableCount2 = await table.locator('xpath=//tr').count()
        //result after filter
        const resultCtn2 = (await page.locator('id=result >> em').textContent()).replace('Selected (2/','').replace('):','');
        const resultCount2 = parseInt(resultCtn2);
        //compare both table count and result
        expect(resultCount2).toEqual(tableCount2);
    //end of first test
    });
    //description of the second test
    test('sort some elements of Datatable', async ({page, browserName}) => {
        test.slow(browserName === 'webkit', 'This test for DataCollection is slow on Mac');
        //locator for sort button, table and table names
        const sortbtn = page.locator('#datatTable-sort-name');
        const table = page.locator('id=dataTable >> tbody')
        const tableFirst = table.locator('xpath=//tr').first()
        const tableSecond = table.locator('xpath=//tr').nth(1)
        const tableLast = table.locator('xpath=//tr').last()
        //click on sort button
        await sortbtn.click({delay: 2000})
        //verify a-z order
        await expect(tableFirst).toContainText("Albertine");
        await expect(tableLast).toContainText("Yasemin");
        //click on sort button
        await sortbtn.click({delay: 2000})
        //verify z-a order
        await expect(tableFirst).toContainText("Yasemin");
        await expect(tableLast).toContainText("Albertine");
        //click on sort button
        await sortbtn.click({delay: 2000})
        //verify original order
        await expect(tableFirst).toHaveAttribute("data-datatable-selected", "true")
        await expect(tableFirst).toHaveAttribute("data-datatable-active", "false")
        await expect(tableSecond).toHaveAttribute("data-datatable-selected", "true")
        await expect(tableFirst).toHaveAttribute("data-datatable-active", "false")
    //end of second test
    });
    //description of the third test
    test('check if scrollIntoView() of Datatable is respected', async ({page, browserName}) => {
        //locator of for some names from the table and the table
        const selected = page.locator('id=Cathrin Schomber B.A.');
        const nameDiv = page.locator('id=Heinz Trubin B.A.');
        const table = page.locator('#dataTable')
        
        await selected.press('Home', {delay: 2000})
        //click on last visible element of the table
        await selected.click({delay: 2000})
        //press "Down" on this element
        await selected.press('ArrowDown', {delay: 2000})
        //set boundaries of table and name
        const tableBox = await table.boundingBox()
        const namebox = await nameDiv.boundingBox()
        //compare the height of center of table and height of active item
        expect(tableBox.y + tableBox.height / 2).toBeCloseTo(namebox.y + namebox.height / 2)
        // await page.mouse.move(tableBox.x + tableBox.width / 2, tableBox.y + tableBox.height / 2);
        // await expect(nameDiv).toHaveAttribute("data-datatable-active", "true")
    //end of third test
    });
//end of our third tests
});

// TESTS FOR GRIDLIST

//description of our first tests
test.describe('To select', () => {
    //description of the first test
    test('unique element of Gridlist through click', async ({page, browserName}) => {
        test.slow(browserName === 'webkit', 'This test for DataCollection is slow on Mac');
        //click on GridList button
        await page.locator('#tabGroup-tab-list-tab-1').click()
        //locator for some names from the table
        const selected1 = page.locator('id=Hansgeorg Kranz');
        const selectedText1 = await selected1.locator('xpath=//h3[1]').textContent();
        const selected2 = page.locator('id=Sigrun Kensy B.Eng.');
        const selectedText2 = await selected2.locator('xpath=//h3[1]').textContent();
        const nameDiv = page.locator('id=Carl Zänker');
        const name = await nameDiv.locator('xpath=//h3[1]').textContent();
        const result = page.locator('#result');
        //first assertions
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText([selectedText1, selectedText2])
        //mouse over on nameDiv element
        await page.mouse.click(0, 0, {delay:5000})
        await nameDiv.scrollIntoViewIfNeeded()
        const namebox = await nameDiv.boundingBox()
        await page.mouse.move(namebox.x + namebox.width / 2, namebox.y + namebox.height / 2, {steps: 5});
        //verify attributes
        await expect(nameDiv).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv).toHaveAttribute("data-datatable-selected", "false")
        //click on nameDiv element
        await nameDiv.dispatchEvent('click')
        //await page.mouse.click(namebox.x + namebox.width / 2, namebox.y + namebox.height / 2);
        //verify new attributes
        await expect(nameDiv).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv).toHaveAttribute("data-datatable-selected", "true")
        await expect(result).toContainText([selectedText1, selectedText2, name])
    //end of first test
    });
    //description of the first test
    test('several elements of Gridlist through click', async ({page, browserName}) => {
        test.slow(browserName === 'webkit', 'This test for DataCollection is slow on Mac');
        //click on GridList button
        await page.locator('#tabGroup-tab-list-tab-1').click()
        await page.mouse.click(0, 0, {delay: 2000})
        //locator for some names from the table
        const selected1 = page.locator('id=Hansgeorg Kranz');
        const selectedText1 = await selected1.locator('xpath=//h3[1]').textContent();
        const selected2 = page.locator('id=Sigrun Kensy B.Eng.');
        const selectedText2 = await selected2.locator('xpath=//h3[1]').textContent();
        const nameDiv1 = page.locator('id=Carl Zänker');
        const name1 = await nameDiv1.locator('xpath=//h3[1]').textContent();
        const nameDiv2 = page.locator('id=Salih Ernst B.A.');
        const name2 = await nameDiv2.locator('xpath=//h3[1]').textContent();
        const nameDiv3 = page.locator('id=Orhan Schacht-Gröttner');
        const name3 = await nameDiv3.locator('xpath=//h3[1]').textContent();
        
        const result = page.locator('#result');
        //first assertions
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText([selectedText1, selectedText2])
        //verify if the switch is off
        await page.mouse.click(0,0,{delay:2000})
        await nameDiv1.scrollIntoViewIfNeeded()
        const namebox1 = await nameDiv1.boundingBox()
        await page.mouse.move(namebox1.x + namebox1.width / 2, namebox1.y + namebox1.height / 2, {steps: 5});
        // //click on switch
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "false")
        //verify if the switch is on
        await nameDiv1.click({delay: 2000})
        //click again on switch
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(result).toContainText([selectedText1, selectedText2, name1])
        //verify if the switch is off
        await page.mouse.click(0,0,{delay:2000})
        await nameDiv2.scrollIntoViewIfNeeded()
        const namebox2 = await nameDiv2.boundingBox()
        await page.mouse.move(namebox2.x + namebox2.width / 2, namebox2.y + namebox2.height / 2, {steps: 5});
        //click on switch
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "false")
        //verify if the switch is on
        await nameDiv2.click({delay: 2000})
        //click again on switch
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "true")
        await expect(result).toContainText([selectedText1, selectedText2, name1, name2])
        //verify if the switch is off
        await page.mouse.click(0,0,{delay:2000})
        await nameDiv3.scrollIntoViewIfNeeded()
        const namebox3 = await nameDiv3.boundingBox()
        await page.mouse.move(namebox3.x + namebox3.width / 2, namebox3.y + namebox3.height / 2, {steps: 5});
        //click on switch
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv3).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv3).toHaveAttribute("data-datatable-selected", "false")
        //verify if the switch is on
        await nameDiv3.click({delay: 2000})
        //click again on switch
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv3).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv3).toHaveAttribute("data-datatable-selected", "true")
        await expect(result).toContainText([selectedText1, selectedText2, name1, name2, name3])
    //end of second test
    });
//end of our first tests
});
//description of our second tests
test.describe('Navigating', () => {
    //description of the first test
    for (const key of ["Enter", "Space"]) {
    test(`with Arrow keys through the items of Gridlist and selects with ${key}`, async ({page, browserName}) => {
        test.slow(browserName === 'webkit', 'This test for DataCollection is slow on Mac');
        //click on GridList button
        await page.locator('#tabGroup-tab-list-tab-1').click()
        await page.mouse.click(0, 0, {delay: 2000})
        //locator for some names from the table
        const selected1 = page.locator('id=Hansgeorg Kranz');
        const selectedText1 = await selected1.locator('xpath=//h3[1]').textContent();
        const selected2 = page.locator('id=Sigrun Kensy B.Eng.');
        const selectedText2 = await selected2.locator('xpath=//h3[1]').textContent();
        const nameDiv1 = page.locator('id=Prof. Alberto Kraushaar B.A.');
        const name1 = await nameDiv1.locator('xpath=//h3[1]').textContent();
        const nameDiv2 = page.locator('id=Monique Riehl');
        const name2 = await nameDiv2.locator('xpath=//h3[1]').textContent();
        const result = page.locator('#result');
        //first assertions
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText([selectedText1, selectedText2])
        //click on nameDiv element
        await page.mouse.click(0,0,{delay:2000})
        const selectedBox2 = await selected2.boundingBox()
        await page.mouse.move(selectedBox2.x + selectedBox2.width / 2, selectedBox2.y + selectedBox2.height / 2, {steps: 5});
        await page.mouse.click(selectedBox2.x + selectedBox2.width / 2, selectedBox2.y + selectedBox2.height / 2,{delay:2000});
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "true")
        await expect(result).toContainText(selectedText1)
        //press "Down" on element
        await selected2.press('ArrowDown', {delay: 2000})
        //verify attributes
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")
        //press "Enter"/"Space" on element
        await nameDiv1.press(key, {delay:2000})
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")
        await expect(result).toContainText([selectedText1, name1])
        //press "Down" on element
        await nameDiv1.press('ArrowDown', {delay: 2000})
        //verify attributes
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "true")
        //press "Enter"/"Space" on element
        await nameDiv2.press(key, {delay: 2000})
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "true")
        await expect(result).toContainText([selectedText1, name1, name2])
        //press "Enter"/"Space" on element
        await nameDiv2.press(key, {delay: 2000})
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "true")
        await expect(result).toContainText([selectedText1, name1])
        //press "Up" on element
        await nameDiv2.press('ArrowUp', {delay: 2000})
        //verify attributes
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "false")
        //press "Enter"/"Space" on element
        await nameDiv1.press(key, {delay: 2000})
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText(selectedText1)
        //press "Up" on element
        await nameDiv1.press('ArrowUp', {delay: 2000})
        //verify attributes
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "true")
        await expect(nameDiv1).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv1).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-selected", "false")
        await expect(nameDiv2).toHaveAttribute("data-datatable-active", "false")
    });
    }
    //description of the second test
    test('through first and last element of Gridlist with keys', async ({page, browserName}) => {
        test.slow(browserName === 'webkit', 'This test for DataCollection is slow on Mac');
        //click on GridList button
        await page.locator('#tabGroup-tab-list-tab-1').click()
        await page.mouse.click(0, 0, {delay: 2000})
        //locator for some names from the table
        const selected1 = page.locator('id=Hansgeorg Kranz');
        const selectedText1 = await selected1.locator('xpath=//h3[1]').textContent();
        const selected2 = page.locator('id=Sigrun Kensy B.Eng.');
        const selectedText2 = await selected2.locator('xpath=//h3[1]').textContent();
        const nameDiv = page.locator('id=Dr. Igor Steckel MBA.');
        const name = await nameDiv.locator('xpath=//h3[1]').textContent();
        const result = page.locator('#result');
        //first assertions
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText([selectedText1, selectedText2])
        //click on first name
        await page.mouse.click(0,0,{delay:2000})
        const selectedBox1 = await selected1.boundingBox()
        await page.mouse.move(selectedBox1.x + selectedBox1.width / 2, selectedBox1.y + selectedBox1.height / 2, {steps: 5});
        await page.mouse.click(selectedBox1.x + selectedBox1.width / 2, selectedBox1.y + selectedBox1.height / 2, {delay:2500});
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected1).toHaveAttribute("data-datatable-active", "true")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText(selectedText2)
        //click on second name
        const selectedBox2 = await selected2.boundingBox()
        await page.mouse.move(selectedBox2.x + selectedBox2.width / 2, selectedBox2.y + selectedBox2.height / 2, {steps: 5});
        await page.mouse.click(selectedBox2.x + selectedBox2.width / 2, selectedBox2.y + selectedBox2.height / 2, {delay:2500});
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "true")
        await expect(result).not.toContainText(selectedText2)
        //press "Home" on second name will jump to first name
        await selected2.press('Home', {delay: 2000})
        //press "Enter" on first name
        await selected1.press('Enter', {delay: 2000})
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "true")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(result).toContainText(selectedText1)
        //press "End" on first name will jump to last name
        await selected1.press('End', {delay: 2000})
        //press "Space" on first name
        await nameDiv.press('Enter', {delay: 2000})
        //verify attributes and result elements
        await expect(selected1).toHaveAttribute("data-datatable-selected", "true")
        await expect(selected1).toHaveAttribute("data-datatable-active", "false")
        await expect(selected2).toHaveAttribute("data-datatable-selected", "false")
        await expect(selected2).toHaveAttribute("data-datatable-active", "false")
        await expect(nameDiv).toHaveAttribute("data-datatable-selected", "true")
        await expect(nameDiv).toHaveAttribute("data-datatable-active", "true")
        await expect(result).toContainText([selectedText1, name])
    //end of second test
    });
//end of our second tests
});

//description of our third tests
test.describe('To', () => {
    //description of the first test
    test('filter some elements of Gridlist', async ({page}) => {
        //click on GridList button
        await page.locator('#tabGroup-tab-list-tab-1').click()
        await page.mouse.click(0, 0, {delay: 2000})
        //locator for filter field and table body
        const filterField = page.locator('#gridList-filter-field');
        const table = page.locator('id=gridList >> ul')
        //fill "Kranz" on filter field
        await filterField.fill("Kranz")
        await page.mouse.click(0, 0, {delay:2000})
        //number of elements in table after filter
        const tableCount1 = await table.locator('xpath=//li').count()
        //result after filter
        const resultCtn1 = (await page.locator('id=result >> em').textContent()).replace('Selected (2/','').replace('):','');
        const resultCount1 = parseInt(resultCtn1);
        //compare both table count and result
        expect(resultCount1).toEqual(tableCount1);
        //fill "Timm" on filter field
        await filterField.fill("Timm")
        await filterField.press('Enter', {delay: 2000})
        //number of elements in table after filter
        const tableCount2 = await table.locator('xpath=//li').count()
        //result after filter
        const resultCtn2 = (await page.locator('id=result >> em').textContent()).replace('Selected (2/','').replace('):','');
        const resultCount2 = parseInt(resultCtn2);
        //compare both table count and result
        expect(resultCount2).toEqual(tableCount2);
    //end of first test
    });
    //description of the second test
    test('sort some elements of Gridlist', async ({page, browserName}) => {
        test.slow(browserName === 'webkit', 'This test for DataCollection is slow on Mac');
        //click on GridList button
        await page.locator('#tabGroup-tab-list-tab-1').click()
        await page.mouse.click(0, 0, {delay: 3000})
        //locator for sort button, table and table names
        const sortbtn = page.locator('#gridList-sort-name');
        const table = page.locator('id=gridList >> ul')
        const tableFirst = table.locator('xpath=//li').first()
        const tableSecond = table.locator('xpath=//li').nth(1)
        const tableLast = table.locator('xpath=//li').last()
        //click on sort button
        await sortbtn.click({delay: 3000})
        //verify a-z order
        await expect(tableFirst).toContainText("Albertine");
        await expect(tableLast).toContainText("Yasemin");
        //click on sort button
        await sortbtn.click({delay: 3000})
        //verify z-a order
        await expect(tableFirst).toContainText("Yasemin");
        await expect(tableLast).toContainText("Albertine");
        //click on sort button
        await sortbtn.click({delay: 3000})
        //verify original order
        await expect(tableFirst).toHaveAttribute("data-datatable-selected", "true")
        await expect(tableFirst).toHaveAttribute("data-datatable-active", "false")
        await expect(tableSecond).toHaveAttribute("data-datatable-selected", "true")
        await expect(tableFirst).toHaveAttribute("data-datatable-active", "false")
    //end of second test
    });
    //description of the third test test
    test('check if scrollIntoView() of Gridlist is respected', async ({page, browserName}) => {
        test.slow(browserName === 'webkit', 'This test for DataCollection is slow on Mac');
        //click on GridList button
        await page.locator('#tabGroup-tab-list-tab-1').click()
        await page.mouse.click(0, 0, {delay: 3000})
        //locator of for some names from the table and the table
        const selected = page.locator('id=Caterina Scholtz');
        const nameDiv1 = page.locator('id=Isabelle Fliegner-Köhler');
        const table = page.locator('#gridList')
        //click and last visible element of the gridlist
        await selected.click({delay: 3000})
        //press "Down" on element
        await selected.press('ArrowDown', {delay: 3000})
        //set boundaries of table
        const tableBox = await table.boundingBox()
        const namebox1 = await nameDiv1.boundingBox()
        //verify if element scrollIntoView() is triggered
        expect(tableBox.y + tableBox.height).toBeCloseTo(namebox1.y + namebox1.height)
        // await page.mouse.move(tableBox.x + tableBox.width / 4, tableBox.y + tableBox.height / 1.33);
        // await expect(nameDiv1).toHaveAttribute("data-datatable-active", "true")

        // await selected.press('ArrowUp')
        // await selected.press('ArrowUp')
        // await selected.press('ArrowUp')
        // await selected.press('ArrowUp')

        // //set boundaries of table
        // const nameDiv2 = page.locator('id=Prof. Alberto Kraushaar B.A.');
        // const tableTop = table.locator('xpath=//ul')
        // const tableTopBox = await tableTop.boundingBox()
        // const namebox2 = await nameDiv2.boundingBox()
        // //verify if element scrollIntoView() is triggered
        // expect(tableTopBox.y).toBeCloseTo(namebox2.y)

        // await page.mouse.move(tableBox.x + tableBox.width / 1.33, tableBox.y + tableBox.height / 4);
        // await expect(nameDiv2).toHaveAttribute("data-datatable-active", "true")


    //end of third test
    });
//end of our third tests
});