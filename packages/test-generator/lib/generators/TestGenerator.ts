/*
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */
import { StudioComponent, StudioTheme } from '@aws-amplify/codegen-ui';
import {
  ModuleKind,
  ScriptTarget,
  ScriptKind,
  ReactRenderConfig,
  ReactOutputConfig,
} from '@aws-amplify/codegen-ui-react';
import log from 'loglevel';
import * as ComponentSchemas from '../components';
import * as ThemeSchemas from '../themes';

const DEFAULT_RENDER_CONFIG = {
  module: ModuleKind.CommonJS,
  target: ScriptTarget.ES2015,
  script: ScriptKind.TSX,
};

const DEFAULT_OUTPUT_CONFIG = {
  outputPathDir: 'ui-components',
};

log.setLevel('info');

export type TestCase = {
  name: string;
  schema: any;
  testType: 'Component' | 'Theme' | 'Snippet';
};

export type TestGeneratorParams = {
  writeToLogger: boolean;
  writeToDisk: boolean;
  renderConfigOverride?: ReactRenderConfig;
  outputConfigOverride?: ReactOutputConfig;
  immediatelyThrowGenerateErrors?: boolean;
};

export abstract class TestGenerator {
  protected readonly params: TestGeneratorParams;

  protected readonly renderConfig: ReactRenderConfig;

  protected readonly outputConfig: ReactOutputConfig;

  constructor(params: TestGeneratorParams) {
    this.params = params;
    this.renderConfig = { ...DEFAULT_RENDER_CONFIG, ...params.renderConfigOverride };
    this.outputConfig = { ...DEFAULT_OUTPUT_CONFIG, ...params.outputConfigOverride };
  }

  generate = (testCases: TestCase[]) => {
    const renderErrors: { [key: string]: any } = {};

    const generateComponent = (testCase: TestCase) => {
      const { name, schema } = testCase;
      try {
        if (this.params.writeToDisk) {
          this.writeComponentToDisk(schema as StudioComponent);
        }

        if (this.params.writeToLogger) {
          const { importsText, compText } = this.renderComponent(schema as StudioComponent);
          log.info(`# ${name}`);
          log.info('## Component Only Output');
          log.info('### componentImports');
          log.info(this.decorateTypescriptWithMarkdown(importsText));
          log.info('### componentText');
          log.info(this.decorateTypescriptWithMarkdown(compText));
        }
      } catch (err) {
        if (this.params.immediatelyThrowGenerateErrors) {
          throw err;
        }
        renderErrors[name] = err;
      }
    };

    const generateTheme = (testCase: TestCase) => {
      const { name, schema } = testCase;
      try {
        if (this.params.writeToDisk) {
          this.writeThemeToDisk(schema as StudioTheme);
        }

        if (this.params.writeToLogger) {
          const theme = this.renderTheme(schema as StudioTheme);
          log.info(`# ${name}`);
          log.info('## Theme Output');
          log.info(this.decorateTypescriptWithMarkdown(theme.componentText));
        }
      } catch (err) {
        if (this.params.immediatelyThrowGenerateErrors) {
          throw err;
        }
        renderErrors[name] = err;
      }
    };

    const generateIndexFile = (indexFileTestCases: TestCase[]) => {
      const schemas = indexFileTestCases.map((testCase) => testCase.schema);
      try {
        if (this.params.writeToDisk) {
          this.writeIndexFileToDisk(schemas);
        }
        if (this.params.writeToLogger) {
          const indexFile = this.renderIndexFile(schemas);
          log.info(`# index`);
          log.info(this.decorateTypescriptWithMarkdown(indexFile.componentText));
        }
      } catch (err) {
        if (this.params.immediatelyThrowGenerateErrors) {
          throw err;
        }
        renderErrors.index = err;
      }
    };

    const generateSnippet = (snippetTestCases: TestCase[]) => {
      const components = snippetTestCases.map((testCase) => testCase.schema);
      try {
        if (this.params.writeToDisk) {
          this.writeSnippetToDisk(components);
        }

        if (this.params.writeToLogger) {
          const { importsText, compText } = this.renderSnippet(components);
          log.info('## Code Snippet Output');
          log.info('### componentImports');
          log.info(this.decorateTypescriptWithMarkdown(importsText));
          log.info('### componentText');
          log.info(this.decorateTypescriptWithMarkdown(compText));
        }
      } catch (err) {
        if (this.params.immediatelyThrowGenerateErrors) {
          throw err;
        }
        renderErrors.snippet = err;
      }
    };

    testCases.forEach((testCase) => {
      switch (testCase.testType) {
        case 'Component':
          generateComponent(testCase);
          break;
        case 'Theme':
          generateTheme(testCase);
          break;
        case 'Snippet':
          generateSnippet([testCase]);
          break;
        default:
          throw new Error('Expected either a `Component` or `Theme` test case type');
      }
    });

    generateIndexFile(testCases);

    // only test with 4 components for performance
    generateSnippet(testCases.filter((testCase) => testCase.testType === 'Component').slice(0, 4));

    if (Object.keys(renderErrors).length > 0) {
      log.error('Caught exceptions while rendering templates');
      Object.entries(renderErrors).forEach(([name, error]) => {
        log.error(`Schema: ${name}`);
        log.error(error);
      });
      throw new Error('Not all tests rendered successfully');
    }
  };

  private decorateTypescriptWithMarkdown = (typescriptSource: string): string => {
    return `\`\`\`typescript jsx\n${typescriptSource}\n\`\`\``;
  };

  abstract writeComponentToDisk(component: StudioComponent): void;

  abstract writeThemeToDisk(theme: StudioTheme): void;

  abstract renderComponent(component: StudioComponent): { compText: string; importsText: string };

  abstract renderTheme(theme: StudioTheme): { componentText: string };

  abstract writeIndexFileToDisk(schemas: (StudioComponent | StudioTheme)[]): void;

  abstract renderIndexFile(schemas: (StudioComponent | StudioTheme)[]): { componentText: string };

  abstract writeSnippetToDisk(components: StudioComponent[]): void;

  abstract renderSnippet(components: StudioComponent[]): { compText: string; importsText: string };

  getTestCases(disabledSchemaNames?: string[]): TestCase[] {
    const disabledSchemaSet = new Set(disabledSchemaNames);
    return [
      ...Object.entries(ComponentSchemas).map(([name, schema]) => {
        return { name, schema, testType: 'Component' } as TestCase;
      }),
      ...Object.entries(ThemeSchemas).map(([name, schema]) => {
        return { name, schema, testType: 'Theme' } as TestCase;
      }),
    ].filter((testCase) => !disabledSchemaSet.has(testCase.name));
  }
}
