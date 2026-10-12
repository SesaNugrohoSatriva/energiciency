export function generateCostingData({ months = 6 } = {}) {
  const data = [];

  for (let index = 0; index < months; index += 1) {
    const currentDate = new Date('2024-07-01');
    currentDate.setMonth(currentDate.getMonth() + index);

    const material = 980000 + index * 76000 + (index % 3) * 21500;
    const labor = 480000 + index * 43000 + (index % 4) * 18000;
    const energy = 92000 + index * 13000 + (index % 2) * 17000;
    const overhead = 250000 + index * 24000 + (index % 5) * 12000;
    const total = material + labor + energy + overhead;

    data.push({
      month: currentDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      material,
      labor,
      energy,
      overhead,
      total,
    });
  }

  return data;
}
