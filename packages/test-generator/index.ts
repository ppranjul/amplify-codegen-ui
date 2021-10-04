import { StudioComponent } from '@amzn/amplify-ui-codegen-schema';
import { StudioTemplateRendererManager, StudioTemplateRendererFactory } from '@amzn/studio-ui-codegen';
import { AmplifyRenderer, ReactOutputConfig, ReactRenderConfig, ScriptKind } from '@amzn/studio-ui-codegen-react';
import { ModuleKind, ScriptTarget } from 'typescript';
import path from 'path';
import log from 'loglevel';

import * as schemas from './lib';

Error.stackTraceLimit = Infinity;

const renderConfig: ReactRenderConfig = {
  module: ModuleKind.CommonJS,
  target: ScriptTarget.ES2015,
  script: ScriptKind.JS,
};

const rendererFactory = new StudioTemplateRendererFactory(
  (component: StudioComponent) => new AmplifyRenderer(component, renderConfig),
);

const outputPathDir = path.resolve(path.join(__dirname, '..', 'ui-components'));
const outputConfig: ReactOutputConfig = {
  outputPathDir,
};
const rendererManager = new StudioTemplateRendererManager(rendererFactory, outputConfig);
Object.entries(schemas).forEach(([name, schema]) => {
  log.info(name);
  try {
    rendererManager.renderSchemaToTemplate(schema as any);
    const buildRenderer = rendererFactory.buildRenderer(schema as any);

    const compOnly = buildRenderer.renderComponentOnly();
    log.info('Component Only Output');
    log.info('componentImports ');
    log.info(compOnly.importsText);
    log.info('componentText ');
    log.info(compOnly.compText);

    const compOnlyAppSample = buildRenderer.renderSampleCodeSnippet();
    log.info('Code Snippet Output');
    log.info('componentImports ');
    log.info(compOnlyAppSample.importsText);
    log.info('componentText ');
    log.info(compOnlyAppSample.compText);
  } catch (err) {
    log.info(`${name} failed with error:`);
    log.info(err);
  }
});
