// import * as wdio from 'webdriverio';
// import * as assert from 'assert';
const wdio = require('webdriverio');
const assert = require('assert');
const find = require('appium-flutter-finder');

const osSpecificOps =
  process.env.APPIUM_OS === 'android'
    ? {
        platformName: 'Android',
        deviceName: 'Pixel 2',
        // @todo support non-unix style path
        app: __dirname + '/../apps/app-free-debug.apk'
      }
    : process.env.APPIUM_OS === 'ios'
    ? {
        platformName: 'iOS',
        platformVersion: '12.2',
        deviceName: 'iPhone X',
        noReset: true,
        app: __dirname + '/../apps/Runner.zip'
      }
    : {};

const opts = {
  port: 4723,
  capabilities: {
    ...osSpecificOps,
    automationName: 'Flutter'
  }
};

(async () => {
  const counterTextFinder = find.byValueKey('counter');
  const buttonFinder = find.byValueKey('increment');

  const driver = await wdio.remote(opts);

  /* new example
  if (process.env.APPIUM_OS === 'android') {
    await driver.switchContext('NATIVE_APP');
    await (await driver.$('~fab')).click();
    await driver.switchContext('FLUTTER');
  } else {
    console.log(
      'Switching context to `NATIVE_APP` is currently only applicable to Android demo app.'
    );
  }
  */

  assert.strictEqual(await driver.getElementText(counterTextFinder), '0');

  await driver.elementClick(buttonFinder);
  await driver.touchAction({
    action: 'tap',
    element: { elementId: buttonFinder }
  });

  assert.strictEqual(await driver.getElementText(counterTextFinder), '2');

  await driver.elementClick(find.byTooltip('Increment'));

  assert.strictEqual(
    await driver.getElementText(
      find.descendant({
        of: find.byTooltip('counter_tooltip'),
        matching: find.byValueKey('counter')
      })
    ),
    '3'
  );

  await driver.elementClick(find.byType('FlatButton'));
  // await driver.waitForAbsent(byTooltip('counter_tooltip'));

  assert.strictEqual(
    await driver.getElementText(find.byText('This is 2nd route')),
    'This is 2nd route'
  );

  await driver.elementClick(find.pageBack());

  assert.strictEqual(
    await driver.getElementText(
      find.descendant({
        of: find.ancestor({
          of: find.bySemanticsLabel(RegExp('counter_semantic')),
          matching: find.byType('Tooltip')
        }),
        matching: find.byType('Text')
      })
    ),
    '3'
  );

  driver.deleteSession();
})();