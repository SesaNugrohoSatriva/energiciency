export function calculateBomCost(materials = []) {
  return materials.reduce((sum, material) => sum + (Number(material.quantity || 0) * Number(material.unitPrice || 0)), 0);
}

export function calculateRoutingCost(routingOperations = [], { energyTariff = 1650, laborRate = 75000, machineOperatingRate = 42000 } = {}) {
  return routingOperations.reduce((sum, operation) => {
    const energyCost = (Number(operation.expectedEnergyKwh || 0) * energyTariff);
    const laborCost = (Number(operation.laborRequirement || 0) * laborRate);
    const machineCost = Number(operation.machineOperatingCost || 0) || (Number(operation.machineRate || 0) || machineOperatingRate);
    return sum + energyCost + laborCost + machineCost;
  }, 0);
}

export function calculateProductCost({ bom = [], routing = [], batchQuantity = 1, energyTariff = 1650, laborRate = 75000, machineOperatingRate = 42000, overheadRate = 0.12 }) {
  const materialCost = calculateBomCost(bom);
  const routingCost = calculateRoutingCost(routing, { energyTariff, laborRate, machineOperatingRate });
  const machineOperatingCost = routing.reduce((sum, operation) => sum + (Number(operation.machineOperatingCost || 0) || 0), 0);
  const overheadCost = (materialCost + routingCost) * overheadRate;
  const totalBatchCost = (materialCost + routingCost + machineOperatingCost + overheadCost) * batchQuantity;
  const costPerUnit = totalBatchCost / Math.max(batchQuantity, 1);

  return {
    materialCost,
    routingCost,
    machineOperatingCost,
    overheadCost,
    totalBatchCost,
    costPerUnit,
    energyTariff,
    laborRate,
    batchQuantity,
  };
}
