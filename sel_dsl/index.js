const {Builder, By} = require('selenium-webdriver');
const parseCLArguments = require('./parse-cli-arguments');
const SExpressionParser = require('./s-expression-parser');


async function runExpression(expression, closeOnError) {
    const driver = new Builder().forBrowser("chrome").build();
    try {
        require("chromedriver");
        try {
            let exp = SExpressionParser.parse(expression);
            await sEval(driver, exp);
        } catch (e) {
            console.warn(e);
        }
    } catch (e) {
        console.error(e);
        if (closeOnError) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            await driver.quit();
        }
    }
}

async function runFromCli(...a) {
    require('chromedriver');
    const args = parseCLArguments(...a);
    const { expression } = args;
    const closeOnError = args["close-on-error"];
    if ([expression].find(v => !v)) {
        throw new Error( ` Some of the following keys are undefined ${JSON.stringify({expression}, null, "\t")} ` );
    }
    await runExpression(expression, closeOnError);
}

async function sEval(driver, exp, env = standardEnv(driver)) {
    if (typeof exp === 'string') {
        if (exp[0].match(/"/)) {
            try {
                return JSON.parse(exp);
            } catch(e) {
                throw e;
            }
        } else {
            return env[exp];
        }
    } else if (typeof exp === 'number') {
        return exp;
    } else {
        const proc = await sEval(driver, exp[0], env);
        const args = await asyncMap(exp.slice(1), x => sEval(driver, x, env));
        try {
            return proc(...args);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}

function standardEnv(driver) {
    return {
        'click': async (selector) => {
            const el = await SearchForElementInIFrames(driver, selector, DEFAULT_TIMEOUT, searchableIFrames);
            if (el) {
                await waitForEnabled(driver, el, DEFAULT_TIMEOUT);
                await el.click();
            } else {
                throw new Error(`Cannot find element ${selector}`);
            }
        },
        'sendKeys': async (selector, content) => {
            const el = await SearchForElementInIFrames(driver, selector, DEFAULT_TIMEOUT, searchableIFrames);
            if (el) {
                await waitForEnabled(driver, el, DEFAULT_TIMEOUT);
                await el.sendKeys(content);
            } else {
                throw new Error(`Cannot find element ${selector}`);
            }
        },
        'get': (url) => {
            try {
                return driver.get(url);
            } catch(e) {
                throw e;
            }
        },
        'waitFor': (...selectors) => waitForSelectors(driver, selectors, DEFAULT_TIMEOUT),
        'setRect': (height, width, x, y) => driver.manager().window().setRect(height, width, x, y),
        'eval': () => {
        },
    }
}

async function asyncMap(arr, func) {
    const ret = Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        const arrElement = arr[i];
        ret[i] = await func(arrElement);
    }
    return ret;
}

async function waitForSelectors(driver, selectors, timeout) {
    const found = new Set();
    let elapsed = 0;
    while (elapsed < timeout) {
        for (let i = 0; i < selectors.length; i++) {
            const selector = selectors[i];
            const el = await findIfExists(driver, selector);
            if (el) found.add(selector)
        }
        if (found.size === selectors.length) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        elapsed += 500;
    }
}

async function findIfExists(driver, selector) {
    return driver.findElements(By.css(selector)).then(found => found[0]);
}

async function findSelectorInIframes(driver, iframeSelectors, selector) {
    console.log(`Finding ${selector}`)
    for (let i = 0; i < iframeSelectors.length; i++) {
        const iframeSelector = iframeSelectors[i];
        try {
            await driver.switchTo().defaultContent();
            // The "0" frame is defaultContent, since we're already here don't switch to it before selecting
            if (iframeSelector !== 0) {
                const f = await findIfExists(driver, iframeSelector);
                if (f) {
                    await driver.switchTo().frame(f)
                }
            }
        } catch (e) {
            console.warn(e);
        }
        const el = await findIfExists(driver, selector);
        if (el) {
            return el;
        }
    }
}

async function SearchForElementInIFrames(driver, selector, timeout, frameSelectors) {
    let elapsed = 0;
    /**
     * The frames which are in the DOM
     *
     @type
         {Promise<*[]>}
     */
    while (timeout > elapsed) {
        elapsed += 500;
        const el = await findSelectorInIframes(driver, [...frameSelectors, 0], selector);
        if (el) return el;
        await new Promise(resolve => setTimeout(resolve, 500))
    }
}

async function waitForEnabled(driver, el, timeout) {
    let elapsed = 0;
    while (elapsed < timeout) {
        elapsed += 500;
        if (el.isEnabled() && await el.isDisplayed()) {
            return el;
        }
        await new Promise(resolve => setTimeout(resolve, 500))
    }
}

if (require.main === module) {
    (async () => {
        await runFromCli(...process.argv.slice(2));
    })();
}

module.exports = runExpression;

