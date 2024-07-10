Object.defineProperty(exports, '__esModule', { value: true });

const util = require('node:util');
const core = require('@sentry/core');
const utils = require('@sentry/utils');

const INTEGRATION_NAME = 'Console';

const _consoleIntegration = (() => {
  return {
    name: INTEGRATION_NAME,
    setup(client) {
      utils.addConsoleInstrumentationHandler(({ args, level }) => {
        if (core.getClient() !== client) {
          return;
        }

        core.addBreadcrumb(
          {
            category: 'console',
            level: utils.severityLevelFromString(level),
            message: util.format.apply(undefined, args),
          },
          {
            input: [...args],
            level,
          },
        );
      });
    },
  };
}) ;

/**
 * Capture console logs as breadcrumbs.
 */
const consoleIntegration = core.defineIntegration(_consoleIntegration);

exports.consoleIntegration = consoleIntegration;
//# sourceMappingURL=console.js.map
