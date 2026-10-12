const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function generateProductionData({ months = 6, startDate = new Date('2024-01-01') } = {}) {
  const data = [];

  for (let index = 0; index < months; index += 1) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(startDate.getMonth() + index);

    const production = 42 + index * 11 + Math.round(Math.sin(index * 1.3) * 9);
    const energy = 32 + index * 7 + Math.round(Math.cos(index * 1.7) * 8);
    const efficiency = clamp(82 + Math.sin(index * 1.1) * 8 + index * 0.7, 76, 96);

    data.push({
      month: currentDate.toLocaleDateString('id-ID', { month: 'short' }),
      label: currentDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      production,
      energy,
      efficiency: Number(efficiency.toFixed(1)),
    });
  }

  return data;
}

export function generateProductionOrders({ count = 8, startDate = new Date('2025-01-14') } = {}) {
  const productBase = [
    'Robot Edukasi R-01',
    'Lengan Robot R-06',
    'Robot Inspeksi V-02',
    'Robot Pick & Place P-09',
    'Robot Welding W-05',
    'Robot Packaging K-12',
    'Clamp Assembly C-03',
    'Vision Servo S-08',
  ];

  const statuses = ['Completed', 'In Progress', 'Planned', 'Delayed'];

  return Array.from({ length: count }, (_, index) => {
    const orderDate = new Date(startDate);
    orderDate.setDate(startDate.getDate() + index * 4);

    const quantity = 12 + index * 9 + (index % 3) * 4;
    const product = productBase[index % productBase.length];
    const status = statuses[index % statuses.length];
    const progress = status === 'Completed' ? 100 : status === 'In Progress' ? 58 + (index % 4) * 11 : 24 + (index % 5) * 12;

    return {
      id: `PO-${String(2600 + index).padStart(4, '0')}`,
      product,
      quantity,
      status,
      progress,
      date: orderDate.toISOString().slice(0, 10),
      energy: `${(quantity * 1.7 + index * 2.1).toFixed(1)} kWh`,
      cost: `Rp${(quantity * 140000 + index * 22000).toLocaleString('id-ID')}`,
      priority: index % 3 === 0 ? 'High' : index % 3 === 1 ? 'Medium' : 'Low',
    };
  });
}
