/* eslint-env jest */
import fs from 'fs/promises';

import { getLoadedModulesAsync, projectRoot } from './utils';
import { executeExpoAsync } from '../utils/expo';

const originalForceColor = process.env.FORCE_COLOR;
const originalCI = process.env.CI;

beforeAll(async () => {
  await fs.mkdir(projectRoot, { recursive: true });
  process.env.FORCE_COLOR = '0';
  process.env.CI = '1';
});

afterAll(() => {
  process.env.FORCE_COLOR = originalForceColor;
  process.env.CI = originalCI;
});

it('loads expected modules by default', async () => {
  const modules = await getLoadedModulesAsync(`require('../../build/src/run').expoRun`);
  expect(modules).toStrictEqual([
    '@expo/cli/build/src/log.js',
    '@expo/cli/build/src/run/hints.js',
    '@expo/cli/build/src/run/index.js',
    '@expo/cli/build/src/utils/args.js',
    '@expo/cli/build/src/utils/env.js',
    '@expo/cli/build/src/utils/errors.js',
    '@expo/cli/build/src/utils/interactive.js',
  ]);
});

it('runs `npx expo run --help`', async () => {
  const results = await executeExpoAsync(projectRoot, ['run', '--help']);
  expect(results.stdout).toMatchInlineSnapshot(`
    "
      Info
        Run the native app locally

      Usage
        $ npx expo run <android|ios>

      Options
        $ npx expo run <android|ios> --help  Output usage information
    "
  `);
});

it('runs `npx expo run android --help`', async () => {
  const results = await executeExpoAsync(projectRoot, ['run', 'android', '--help']);
  expect(results.stdout).toMatchInlineSnapshot(`
    "› Using expo run:android --help

      Description
        Run the native Android app locally

      Usage
        $ npx expo run:android [Options] [--] [ProjectRoot] Default: PWD

      Options 
        --no-build-cache       Clear the native build cache
        --no-install           Skip installing dependencies
        --no-bundler           Skip starting the bundler
        --app-id <appId>       Custom Android application ID to launch.
        --variant <name>       Build variant or product flavor and build variant. Default: debug
        --binary <path>        Path to existing .apk or .aab to install.
        -d, --device [device]  Device name to run the app on
        -p, --port <port>      Port to start the dev server on. Default: 8081
        -h, --help             Output usage information

      Note: If specified, ProjectRoot must not be preceded by \`--device/-d\`. Use the \`--\` separator in that case.
    "
  `);
});

it('runs `npx expo run ios --help`', async () => {
  const results = await executeExpoAsync(projectRoot, ['run', 'ios', '--help']);
  expect(results.stdout).toMatchInlineSnapshot(`
    "› Using expo run:ios --help

      Info
        Run the iOS app binary locally

      Usage
        $ npx expo run:ios [Options] [--] [ProjectRoot] Default: PWD

      Options
        --no-build-cache                 Clear the native derived data before building
        --no-install                     Skip installing dependencies
        --no-bundler                     Skip starting the Metro bundler
        --scheme [scheme]                Scheme to build
        --binary <path>                  Path to existing .app or .ipa to install.
        --configuration <configuration>  Xcode configuration to use. Debug or Release. Default: Debug
        -d, --device [device]            Device name or UDID to build the app on
        -p, --port <port>                Port to start the Metro bundler on. Default: 8081
        -h, --help                       Usage info

      Note: If specified, ProjectRoot must not be preceded by \`--device/-d\` or \`--scheme\`. Use the \`--\` separator in that case.

      Build for production (unsigned) with the Release configuration:
        $ npx expo run:ios --configuration Release
    "
  `);
});
