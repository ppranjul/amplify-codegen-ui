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
import * as React from 'react';
import { Hub } from 'aws-amplify';

import {
  ACTION_STATE_MUTATION_FINISHED,
  ACTION_STATE_MUTATION_STARTED,
  EVENT_ACTION_CORE_STATE_MUTATION,
  UI_CHANNEL,
} from './constants';
import { AMPLIFY_SYMBOL } from '../amplify-symbol';

/**
 * Action to wrap React.useState with Hub events
 * @internal
 */
type UseStateMutationAction<StateType> = [StateType, (newState: StateType) => void];

/**
 * Action to wrap React.useState with Hub events
 * @internal
 */
export const useStateMutationAction = <StateType>(initialState: StateType): UseStateMutationAction<StateType> => {
  const [state, setState] = React.useState(initialState);

  const setNewState = React.useCallback(
    (newState: StateType) => {
      const prevState = state;

      Hub.dispatch(
        UI_CHANNEL,
        {
          event: ACTION_STATE_MUTATION_STARTED,
          data: { prevState, newState },
        },
        EVENT_ACTION_CORE_STATE_MUTATION,
        AMPLIFY_SYMBOL,
      );

      setState(newState);

      Hub.dispatch(
        UI_CHANNEL,
        {
          event: ACTION_STATE_MUTATION_FINISHED,
          data: { prevState, newState },
        },
        EVENT_ACTION_CORE_STATE_MUTATION,
        AMPLIFY_SYMBOL,
      );
    },
    [state],
  );

  return [state, setNewState];
};

export const useStateMutationActionString = `export const useStateMutationAction = (initialState) => {
  const [state, setState] = React.useState(initialState);

  const setNewState = React.useCallback(
    (newState) => {
      const prevState = state;

      Hub.dispatch(
        UI_CHANNEL,
        {
          event: ACTION_STATE_MUTATION_STARTED,
          data: { prevState, newState },
        },
        EVENT_ACTION_CORE_STATE_MUTATION,
        AMPLIFY_SYMBOL,
      );

      setState(newState);

      Hub.dispatch(
        UI_CHANNEL,
        {
          event: ACTION_STATE_MUTATION_FINISHED,
          data: { prevState, newState },
        },
        EVENT_ACTION_CORE_STATE_MUTATION,
        AMPLIFY_SYMBOL,
      );
    },
    [state],
  );

  return [state, setNewState];
};`;
