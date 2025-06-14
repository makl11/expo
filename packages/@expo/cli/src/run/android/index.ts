#!/usr/bin/env node
import arg from 'arg';
import chalk from 'chalk';
import path from 'path';

import { Command } from '../../../bin/cli';
import * as Log from '../../log';
import { assertWithOptionsArgs } from '../../utils/args';
import { logCmdError } from '../../utils/errors';

export const expoRunAndroid: Command = async (argv) => {
  const rawArgsMap: arg.Spec = {
    // Types
    '--help': Boolean,
    '--no-build-cache': Boolean,
    '--no-install': Boolean,
    '--no-bundler': Boolean,
    '--variant': String,
    '--binary': String,
    '--app-id': String,
    // Unstable, temporary fallback to disable active archs only behavior
    // TODO: replace with better fallback option, like free-form passing gradle props
    '--all-arch': Boolean,

    '--port': Number,
    // Aliases
    '-p': '--port',

    '-h': '--help',
  };
  const args = assertWithOptionsArgs(rawArgsMap, {
    argv,
    permissive: true,
    stopAtPositional: true,
  });

  // '-d' -> '--device': Boolean,

  if (args['--help']) {
    Log.exit(
      chalk`
  {bold Description}
    Run the native Android app locally

  {bold Usage}
    $ npx expo run:android [Options] [--] [ProjectRoot] {dim Default: PWD}

  {bold Options} 
    --no-build-cache       Clear the native build cache
    --no-install           Skip installing dependencies
    --no-bundler           Skip starting the bundler
    --app-id <appId>       Custom Android application ID to launch.
    --variant <name>       Build variant or product flavor and build variant. {dim Default: debug}
    --binary <path>        Path to existing .apk or .aab to install.
    -d, --device [device]  Device name to run the app on
    -p, --port <port>      Port to start the dev server on. {dim Default: 8081}
    -h, --help             Output usage information

  {underline Note}: If specified, ProjectRoot must not be preceded by \`--device/-d\`. Use the \`--\` separator in that case.
`,
      0
    );
  }

  const { resolveStringOrBooleanArgsAsync } = await import('../../utils/resolveArgs.js');
  const parsed = await resolveStringOrBooleanArgsAsync(argv ?? [], rawArgsMap, {
    '--device': Boolean,
    '-d': '--device',
  }).catch(logCmdError);

  const { runAndroidAsync } = await import('./runAndroidAsync.js');

  return runAndroidAsync(path.resolve(parsed.projectRoot), {
    // Parsed options
    buildCache: !args['--no-build-cache'],
    install: !args['--no-install'],
    bundler: !args['--no-bundler'],
    port: args['--port'],
    variant: args['--variant'],
    allArch: args['--all-arch'],
    binary: args['--binary'],
    appId: args['--app-id'],
    // Custom parsed args
    device: parsed.args['--device'],
  }).catch(logCmdError);
};
