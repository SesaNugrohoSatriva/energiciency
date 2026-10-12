export function safeRatio(numerator, denominator, { allowZero = false } = {}) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    return null;
  }

  if (denominator === 0) {
    return allowZero ? 0 : null;
  }

  return numerator / denominator;
}

export function calculateAvailability({ operatingTime, plannedProductionTime }) {
  const ratio = safeRatio(operatingTime, plannedProductionTime);
  if (ratio === null) {
    return null;
  }

  if (ratio < 0 || ratio > 1.2) {
    return null;
  }

  return ratio;
}

export function calculatePerformance({ idealCycleTime, totalOutput, operatingTime }) {
  if (!Number.isFinite(idealCycleTime) || idealCycleTime < 0) {
    return null;
  }

  const ratio = safeRatio(idealCycleTime * totalOutput, operatingTime);
  if (ratio === null) {
    return null;
  }

  if (ratio < 0 || ratio > 3) {
    return null;
  }

  return ratio;
}

export function calculateQuality({ goodOutput, totalOutput }) {
  const ratio = safeRatio(goodOutput, totalOutput);
  if (ratio === null) {
    return null;
  }

  if (ratio < 0 || ratio > 1) {
    return null;
  }

  return ratio;
}

export function calculateOEE({ operatingTime, plannedProductionTime, idealCycleTime, totalOutput, goodOutput }) {
  const availability = calculateAvailability({ operatingTime, plannedProductionTime });
  const performance = calculatePerformance({ idealCycleTime, totalOutput, operatingTime });
  const quality = calculateQuality({ goodOutput, totalOutput });

  if ([availability, performance, quality].some((value) => value === null)) {
    return {
      availability: null,
      performance: null,
      quality: null,
      oee: null,
      valid: false,
    };
  }

  return {
    availability,
    performance,
    quality,
    oee: availability * performance * quality,
    valid: true,
  };
}

export function calculateAggregatedOEE(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return null;
  }

  const validRecords = records.filter((record) => record && record.valid && record.oee !== null);
  const totalOperatingTime = validRecords.reduce((sum, record) => sum + (Number(record.operatingTime) || 0), 0);

  if (totalOperatingTime <= 0) {
    return null;
  }

  const weightedOee = validRecords.reduce((sum, record) => sum + (record.oee * (Number(record.operatingTime) || 0)), 0) / totalOperatingTime;

  return {
    weightedOee,
    totalOperatingTime,
    count: validRecords.length,
  };
}

export function calculateAverageOEE(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return null;
  }

  const validValues = records
    .map((record) => (record && record.oee !== null && Number.isFinite(record.oee) ? record.oee : null))
    .filter((value) => value !== null);

  if (validValues.length === 0) {
    return null;
  }

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

export function calculateOEETrend(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  return records
    .map((record) => {
      const calculated = calculateOEE({
        operatingTime: record.operatingTime,
        plannedProductionTime: record.plannedProductionTime,
        idealCycleTime: record.idealCycleTime,
        totalOutput: record.totalOutput,
        goodOutput: record.goodOutput,
      });

      return {
        ...record,
        ...calculated,
      };
    })
    .filter((record) => record.valid);
}

export function calculatePeriodComparison(currentValue, previousValue) {
  if (currentValue === null || previousValue === null || previousValue === 0) {
    return null;
  }

  return (currentValue - previousValue) / previousValue;
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Insufficient data';
  }

  return `${(value * 100).toFixed(1)}%`;
}
