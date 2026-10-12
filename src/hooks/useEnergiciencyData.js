import { useMemo } from 'react';
import { buildMockData } from '../data/mockDatabase';

export default function useEnergiciencyData() {
  return useMemo(() => buildMockData(), []);
}
