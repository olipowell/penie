import asyncio, os
from pathlib import Path
SCREENSHOTS = Path(os.environ.get("PENIE_SCREENSHOTS", "/tmp/browser/pen028"))
SCREENSHOTS.mkdir(parents=True, exist_ok=True)
from playwright.async_api import async_playwright
ORIGINAL = 'There once was a man called bob\n\nHe lived in a house like a slob'
EXPECTED = ORIGINAL.replace('bob', 'Bob')
async def scenario(browser, action):
    context = await browser.new_context(viewport={'width':1280,'height':1800})
    page = await context.new_page()
    errors=[]; requests=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('request', lambda r: requests.append(r) if '/api/chat' in r.url else None)
    await page.goto('http://localhost:8080')
    editor=page.get_by_role('textbox',name='Your writing',exact=True)
    await editor.fill(ORIGINAL.split('\n\n')[0])
    await editor.press('Enter')
    await page.keyboard.insert_text(ORIGINAL.split('\n\n')[1])
    await page.get_by_role('button',name='Ask Penie',exact=True).click()
    await page.get_by_role('textbox',name='Message Penie').fill('Check my spelling and grammar.')
    await page.get_by_role('button',name='Send',exact=True).click()
    await page.get_by_role('button',name='I understand, send').click()
    try:
        await page.get_by_role('button',name='Allow once',exact=True).click(timeout=60000)
    except Exception:
        await page.screenshot(path=str(SCREENSHOTS / 'access-failure.png'))
        print('FAIL: permission card did not appear; screenshot captured')
        raise
    card=page.get_by_role('group',name='Proposed correction')
    await page.get_by_role('button',name='Accept',exact=True).wait_for(timeout=90000)
    await page.wait_for_function("() => [...document.querySelectorAll('button')].some(b=>b.textContent==='Accept' && !b.disabled)")
    assert await card.count()==1, 'Expected only one correction'
    assert await card.locator('del').inner_text()=='bob'
    assert await card.locator('ins').inner_text()=='Bob'
    n=len(requests)
    if action=='accept':
        await page.get_by_role('button',name='Accept',exact=True).click()
        assert await editor.evaluate("e => [...e.children].map(p=>p.textContent).join('\\n\\n')")==EXPECTED
        await page.screenshot(path=str(SCREENSHOTS / 'accept.png'))
        await page.get_by_role('button',name='Undo (Ctrl/Cmd+Z)',exact=True).click()
        assert await editor.evaluate("e => [...e.children].map(p=>p.textContent).join('\\n\\n')")==ORIGINAL
    elif action=='thinking':
        await page.get_by_role('button',name='Still thinking',exact=True).click()
        assert await editor.evaluate("e => [...e.children].map(p=>p.textContent).join('\\n\\n')")==ORIGINAL
        await page.screenshot(path=str(SCREENSHOTS / 'thinking.png'))
    else:
        await editor.click()
        await editor.press('Control+End')
        await page.keyboard.insert_text('!')
        await page.get_by_role('button',name='Accept',exact=True).click()
        assert await editor.evaluate("e => [...e.children].map(p=>p.textContent).join('\\n\\n')")==ORIGINAL+'!'
        assert await card.get_by_role('status').inner_text() == "Your writing has changed, or this passage couldn't be identified safely. Nothing was changed. Ask me to check it again."
        await page.screenshot(path=str(SCREENSHOTS / 'stale.png'))
    await page.wait_for_timeout(1500)
    assert len(requests)==n, 'Accept or Still thinking made another AI request'
    assert not errors, errors
    print(action, 'PASS; real AI correction bob → Bob; requests:',n)
    await context.close()
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        for action in ['accept','thinking','stale']:
            await scenario(browser,action)
            # Stay below the existing 8 requests/minute safeguard.
            await asyncio.sleep(22)
        await browser.close()
asyncio.run(main())
