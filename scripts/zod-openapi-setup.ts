/**
 * Side-effect module: extends Zod with `.openapi()` before any schema is built.
 *
 * Zod v4 attaches methods to each schema instance at construction time, so
 * `extendZodWithOpenApi` only affects schemas created after it runs. Import this
 * module first so the playwright-e2e schemas pick up `.openapi()` when loaded.
 */
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);
