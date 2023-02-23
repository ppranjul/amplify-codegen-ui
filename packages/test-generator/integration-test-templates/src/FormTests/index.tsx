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
import { Link, useParams } from 'react-router-dom';
import CustomDog from './CustomDog';
import CustomNestedJSON from './CustomNestedJSON';
import DSAllSupportedFormFields from './DSAllSupportedFormFields';
import DSCompositeDog from './DSCompositeDog';
import DSCompositeToy from './DSCompositeToy';
import DSCPKTeacher from './DSCPKTeacher';
import DSBidirectionalOwnerDog from './DSBidirectionalOwnerDog';

export default function FormTests() {
  const { subject } = useParams();

  switch (subject) {
    case 'CustomDog':
      return <CustomDog />;
    case 'CustomNestedJSON':
      return <CustomNestedJSON />;
    case 'DSAllSupportedFormFields':
      return <DSAllSupportedFormFields />;
    case 'DSCompositeDog':
      return <DSCompositeDog />;
    case 'DSCompositeToy':
      return <DSCompositeToy />;
    case 'DSCPKTeacher':
      return <DSCPKTeacher />;
    case 'DSBidirectionalOwnerDog':
      return <DSBidirectionalOwnerDog />;
    default:
      return (
        <div>
          <h1>Codegen UI Form Functional Tests</h1>
          <ul>
            <li>
              <Link to="CustomDog">CustomDog</Link>
            </li>
            <li>
              <Link to="CustomNestedJSON">CustomNestedJSON</Link>
            </li>
            <li>
              <Link to="DSAllSupportedFormFields">DSAllSupportedFormFields</Link>
            </li>
            <li>
              <Link to="DSCompositeDog">DSCompositeDog</Link>
            </li>
            <li>
              <Link to="DSCompositeToy">DSCompositeToy</Link>
            </li>
            <li>
              <Link to="DSCPKTeacher">DSCPKTeacher</Link>
            </li>
            <li>
              <Link to="DSBidirectionalOwnerDog">DSBidirectionalOwnerDog</Link>
            </li>
          </ul>
        </div>
      );
  }
}
