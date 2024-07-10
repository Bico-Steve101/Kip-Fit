import * as util from 'node:util';
import { defineIntegration, getClient, addBreadcrumb } from '@sentry/core';
import { addConsoleInstrumentationHandler, severityLevelFromString } from '@sentry/utils';

const INTEGRATION_NAME = 'Console';

const _consoleIntegration = (() => {
  return {
    name: INTEGRATION_NAME,
    setup(client) {
      addConsoleInstrumentationHandler(({ args, level }) => {
        if (getClient() !== client) {
          return;
        }

        addBreadcrumb(
          {
            category: 'console',
            level: severityLevelFromString(level),
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
const consoleIntegration = defineIntegration(_consoleIntegration);

export { consoleIntegration };
//# sourceMappingURL=console.js.map
