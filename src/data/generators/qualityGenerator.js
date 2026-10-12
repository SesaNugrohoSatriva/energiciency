export function generateQualityData({ count = 10 } = {}) {
  const statuses = ['Passed', 'Failed', 'Needs Review'];
  const defects = [0, 1, 2, 3, 4, 6];

  return Array.from({ length: count }, (_, index) => {
    const status = statuses[index % statuses.length];
    const defectCount = status === 'Passed' ? defects[index % 3] : status === 'Failed' ? 3 + (index % 4) : 1 + (index % 3);
    const orderId = `PO-${String(2605 + index).padStart(4, '0')}`;

    return {
      id: `QC-${String(101 + index).padStart(3, '0')}`,
      orderId,
      product: index % 2 === 0 ? 'Robot Arm R-06' : 'Servo Module V-02',
      inspector: index % 2 === 0 ? 'Nadia' : 'Rafi',
      status,
      defects: defectCount,
      defectRate: Number(((defectCount / 45) * 100).toFixed(1)),
      passed: status === 'Passed',
      date: new Date(2025, 0, 11 + index).toISOString().slice(0, 10),
    };
  });
}
