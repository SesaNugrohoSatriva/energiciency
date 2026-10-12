export function generateInventoryData({ count = 9 } = {}) {
  const categories = ['Mechanic', 'Electronics', 'Safety', 'Consumables'];
  const items = [
    'Servo Motor',
    'Welding Rod',
    'Safety Glove',
    'Control Panel',
    'Gearbox',
    'Hydraulic Pump',
    'Electrical Relay',
    'Lubricant Oil',
    'Air Filter',
    'Sensor Array',
  ];

  return Array.from({ length: count }, (_, index) => {
    const stock = 18 + index * 9 + (index % 4) * 3;
    const threshold = 22 + (index % 3) * 9;
    const unit = index % 2 === 0 ? 'pcs' : 'box';
    const category = categories[index % categories.length];

    return {
      sku: `INV-${String(100 + index).padStart(3, '0')}`,
      name: items[index % items.length],
      category,
      stock,
      threshold,
      unit,
      location: `Rack ${String((index % 5) + 1).padStart(2, '0')}`,
      unitCost: 120000 + index * 18000,
      status: stock <= threshold ? 'Low Stock' : stock <= threshold * 1.5 ? 'Monitor' : 'Healthy',
    };
  });
}
