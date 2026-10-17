/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import StudentPortal from './StudentPortal';
import { StudentResult } from '../types';

interface ResultsViewProps {
  results: StudentResult[];
  onNavigatePage?: (page: string) => void;
}

export default function ResultsView({ results, onNavigatePage }: ResultsViewProps) {
  return <StudentPortal results={results} onNavigatePage={onNavigatePage} />;
}
