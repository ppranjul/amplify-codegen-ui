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
import {
  StudioComponent,
  StudioComponentChild,
  FormDefinition,
  FormDefinitionElement,
  FormStyleConfig,
  StudioComponentProperties,
  StudioFormStyle,
} from '../../types';
import { mapElementChildren } from './helpers/map-element-children';
import { ctaButtonMapper, addCTAPosition } from './helpers/map-cta-buttons';
import { InternalError } from '../../errors';

const getStyleResolvedValue = (config: FormStyleConfig): string => {
  const value = config.value ?? config.tokenReference;
  if (!value) {
    throw new InternalError('Form layout style not found');
  }
  return value;
};

const resolveStyles = (style: FormDefinition['form']['layoutStyle']): Record<keyof StudioFormStyle, string> => {
  return {
    verticalGap: getStyleResolvedValue(style.verticalGap),
    horizontalGap: getStyleResolvedValue(style.horizontalGap),
    outerPadding: getStyleResolvedValue(style.outerPadding),
  };
};

const parentGrid = (
  name: string,
  style: FormDefinition['form']['layoutStyle'],
  children: StudioComponentChild[],
): StudioComponentChild => {
  const { verticalGap, horizontalGap, outerPadding } = resolveStyles(style);
  return {
    name,
    componentType: 'Grid',
    properties: {
      columnGap: { value: horizontalGap },
      rowGap: { value: verticalGap },
      padding: { value: outerPadding },
    },
    children,
  };
};

const mapFormElementProps = (element: FormDefinitionElement) => {
  const props: StudioComponentProperties = {};
  Object.entries(element.props).forEach(([key, value]) => {
    props[key] = { value: `${value}`, type: `${typeof value}` };
  });
  return props;
};

const fieldComponentMapper = (name: string, formDefinition: FormDefinition): StudioComponentChild => {
  // will accept a field matrix from a defnition and map
  const fieldChildren = formDefinition.elementMatrix.map<StudioComponentChild>((row: string[], rowIdx: number) => {
    return {
      name: `RowGrid${rowIdx}`,
      componentType: 'Grid',
      properties: {
        columnGap: { value: 'inherit' },
        rowGap: { value: 'inherit' },
        ...(row.length > 0 && {
          templateColumns: { value: `repeat(${row.length}, auto)` },
        }),
      },
      children: row.map<StudioComponentChild>((column) => {
        const element: FormDefinitionElement = formDefinition.elements[column];
        return {
          name: column,
          componentType: element.componentType,
          properties: mapFormElementProps(element),
          children: mapElementChildren(column, element).children,
        };
      }),
    };
  });
  return parentGrid(`${name}Grid`, formDefinition.form.layoutStyle, fieldChildren);
};

export const mapFormDefinitionToComponent = (name: string, formDefinition: FormDefinition) => {
  const component: StudioComponent = {
    name,
    componentType: 'form',
    properties: {},
    bindingProperties: {
      onCancel: { type: 'Event' },
    },
    events: {},
    children: [fieldComponentMapper(name, formDefinition)],
  };

  const ctaComponent = ctaButtonMapper(formDefinition);
  component.children = addCTAPosition(
    component.children ? component.children : [],
    formDefinition.buttons.position,
    ctaComponent,
  );

  return component;
};
