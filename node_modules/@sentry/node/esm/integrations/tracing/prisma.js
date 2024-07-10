import { _optionalChain } from '@sentry/utils';
import * as prismaInstrumentation from '@prisma/instrumentation';
import { defineIntegration, spanToJSON, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN } from '@sentry/core';
import { generateInstrumentOnce } from '../../otel/instrument.js';

const INTEGRATION_NAME = 'Prisma';

const instrumentPrisma = generateInstrumentOnce(INTEGRATION_NAME, () => {
  const EsmInteropPrismaInstrumentation =
    // @ts-expect-error We need to do the following for interop reasons
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    _optionalChain([prismaInstrumentation, 'access', _ => _.default, 'optionalAccess', _2 => _2.PrismaInstrumentation]) || prismaInstrumentation.PrismaInstrumentation;

  return new EsmInteropPrismaInstrumentation({});
});

const _prismaIntegration = (() => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      instrumentPrisma();
    },

    setup(client) {
      client.on('spanStart', span => {
        const spanJSON = spanToJSON(span);
        if (_optionalChain([spanJSON, 'access', _3 => _3.description, 'optionalAccess', _4 => _4.startsWith, 'call', _5 => _5('prisma:')])) {
          span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, 'auto.db.otel.prisma');
        }

        if (spanJSON.description === 'prisma:engine:db_query') {
          span.setAttribute('db.system', 'prisma');
        }
      });
    },
  };
}) ;

/**
 * Prisma integration
 *
 * Capture tracing data for prisma.
 * Note: This requieres to set:
 * previewFeatures = ["tracing"]
 * For the prisma client.
 * See https://www.prisma.io/docs/concepts/components/prisma-client/opentelemetry-tracing for more details.
 */
const prismaIntegration = defineIntegration(_prismaIntegration);

export { instrumentPrisma, prismaIntegration };
//# sourceMappingURL=prisma.js.map
