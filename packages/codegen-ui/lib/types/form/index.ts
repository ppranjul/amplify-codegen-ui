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

import { StudioFormStyle } from './style';
import { StudioFormFields, StudioFormFieldConfig } from './fields';
import { SectionalElement } from './sectional-element';
import { FormDefinition, FormDefinitionElementProps } from './form-definition';

/**
 * Data type definition for StudioForm
 */
type StudioFormDataType = {
  dataSourceType: 'DataStore' | 'Custom';

  dataTypeName: string;
};

/**
 * This is the base type for all StudioForms
 */
export type StudioForm = {
  dataType: StudioFormDataType;

  fields: StudioFormFields;

  sectionalElements: SectionalElement[];

  style: StudioFormStyle;
};

export type { StudioFormStyle, SectionalElement, StudioFormFieldConfig, FormDefinition, FormDefinitionElementProps };
