export function generateEnergyData({ days = 14 } = {}) {
  const data = [];

  for (let index = 0; index < days; index += 1) {
    const currentDate = new Date('2025-01-01');
    currentDate.setDate(currentDate.getDate() + index);

    const kwh = 510 + Math.round(Math.sin(index / 2.6) * 120 + index * 11 + (index % 4) * 20);
    const target = 500 + Math.round(Math.cos(index / 3.4) * 55) + (index % 5) * 10;
    const peak = Math.max(kwh, target) + 40 + (index % 3) * 10;
    const cost = kwh * 1640;

    data.push({
      date: currentDate.toISOString().slice(0, 10),
      label: currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      kwh,
      target,
      peak,
      cost,
      machine: index % 3 === 0 ? 'Robot Welding' : index % 3 === 1 ? 'Stamping' : 'Assembly',
    });
  }

  return data;
}

export function generateEnergyProcessData() {
  return [
    { name: 'Welding', energy: 42, target: 36, utilization: 92 },
    { name: 'Assembly', energy: 36, target: 33, utilization: 87 },
    { name: 'Cutting', energy: 27, target: 24, utilization: 79 },
    { name: 'Finishing', energy: 19, target: 18, utilization: 72 },
  ];
}
