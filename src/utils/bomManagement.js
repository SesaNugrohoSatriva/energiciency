export function buildBomComponent(input = {}, index = 0) {
  const id = input.id || input.componentId || `CMP-${String(index + 1).padStart(3, '0')}`;
  const componentCode = input.componentCode || input.componentId || id;
  const quantity = Number(input.quantity ?? input.quantityPerUnit ?? 1);
  const unitCost = Number(input.unitCost ?? input.unitPrice ?? 0);
  const scrapRate = Number(input.scrapRate ?? 0);

  return {
    id,
    componentCode,
    componentId: componentCode,
    componentName: input.componentName || input.name || 'New component',
    inventorySku: input.inventorySku || input.inventoryId || '',
    inventoryName: input.inventoryName || '',
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    unitOfMeasure: input.unitOfMeasure || input.unit || 'set',
    unitCost: Number.isFinite(unitCost) ? unitCost : 0,
    scrapRate: Number.isFinite(scrapRate) ? scrapRate : 0,
    notes: input.notes || '',
    isSimulated: true,
  };
}

export function calculateMaterialRequirements(bom = {}, requestedQuantity = 1, inventoryCatalog = []) {
  const orderQuantity = Number(requestedQuantity || 1);
  const components = Array.isArray(bom.components) ? bom.components : [];

  return components.map((component, index) => {
    const quantityPerUnit = Number(component.quantity ?? component.quantityPerUnit ?? 0);
    const scrapRate = Number(component.scrapRate ?? 0);
    const grossQuantity = quantityPerUnit * orderQuantity * (1 + scrapRate / 100);
    const inventory = inventoryCatalog.find((item) => {
      const sku = item.sku || item.id || '';
      return sku === component.inventorySku || item.name === component.inventoryName;
    }) || null;
    const availableStock = inventory ? Number(inventory.stock || 0) : 0;
    const shortage = Math.max(0, grossQuantity - availableStock);

    return {
      ...buildBomComponent(component, index),
      quantityPerUnit,
      grossQuantity,
      availableStock,
      shortage,
      requirement: grossQuantity,
      unitCost: Number(component.unitCost ?? component.unitPrice ?? 0),
      inventory,
    };
  });
}

export function calculateBomMaterialCost(bom = {}, requestedQuantity = 1, inventoryCatalog = []) {
  return calculateMaterialRequirements(bom, requestedQuantity, inventoryCatalog).reduce((sum, item) => {
    return sum + (Number(item.grossQuantity || 0) * Number(item.unitCost || 0));
  }, 0);
}

export function validateBom(bom = {}, existingBoms = [], inventoryCatalog = []) {
  const blockingErrors = [];
  const warnings = [];
  const components = Array.isArray(bom.components) ? bom.components : [];

  if (!bom.productId) {
    blockingErrors.push({ field: 'productId', message: 'Missing product reference.', blocking: true });
  }

  if (!bom.bomCode || !String(bom.bomCode).trim()) {
    blockingErrors.push({ field: 'bomCode', message: 'Missing BOM code.', blocking: true });
  }

  if (existingBoms.some((candidate) => candidate.id !== bom.id && candidate.bomCode === bom.bomCode)) {
    blockingErrors.push({ field: 'bomCode', message: 'Duplicate BOM code.', blocking: true });
  }

  const outputQuantity = Number(bom.outputQuantity ?? 1);
  if (!Number.isFinite(outputQuantity) || outputQuantity <= 0) {
    blockingErrors.push({ field: 'outputQuantity', message: 'Invalid output quantity.', blocking: true });
  }

  if (!components.length) {
    blockingErrors.push({ field: 'components', message: 'BOM requires at least one component.', blocking: true });
  }

  const seenIds = new Set();

  components.forEach((component, index) => {
    const normalized = buildBomComponent(component, index);
    if (!normalized.componentName || !String(normalized.componentName).trim()) {
      blockingErrors.push({ field: `components.${index}.componentName`, message: 'Missing component name.', blocking: true });
    }

    if (!normalized.componentCode || !String(normalized.componentCode).trim()) {
      blockingErrors.push({ field: `components.${index}.componentCode`, message: 'Missing component code.', blocking: true });
    }

    if (seenIds.has(normalized.componentCode)) {
      blockingErrors.push({ field: `components.${index}.componentCode`, message: 'Duplicate component ID.', blocking: true });
    }
    seenIds.add(normalized.componentCode);

    if (!Number.isFinite(Number(normalized.quantity)) || Number(normalized.quantity) <= 0) {
      blockingErrors.push({ field: `components.${index}.quantity`, message: 'Invalid component quantity.', blocking: true });
    }

    if (!normalized.inventorySku || !String(normalized.inventorySku).trim()) {
      warnings.push({ field: `components.${index}.inventorySku`, message: 'Inventory reference missing; cost estimation may be incomplete.', blocking: false });
    } else {
      const inventoryItem = inventoryCatalog.find((item) => item.sku === normalized.inventorySku || item.id === normalized.inventorySku);
      if (!inventoryItem) {
        warnings.push({ field: `components.${index}.inventorySku`, message: 'Inventory item not found in catalog.', blocking: false });
      } else if (inventoryItem.status === 'Archived' || inventoryItem.archived) {
        blockingErrors.push({ field: `components.${index}.inventorySku`, message: 'Archived inventory item cannot be used.', blocking: true });
      }
    }

    if (normalized.unitCost < 0) {
      blockingErrors.push({ field: `components.${index}.unitCost`, message: 'Negative unit cost is invalid.', blocking: true });
    }

    if (!normalized.unitOfMeasure || !String(normalized.unitOfMeasure).trim()) {
      blockingErrors.push({ field: `components.${index}.unitOfMeasure`, message: 'Missing unit of measure.', blocking: true });
    }

    if (normalized.scrapRate < 0 || normalized.scrapRate > 100) {
      blockingErrors.push({ field: `components.${index}.scrapRate`, message: 'Invalid scrap rate.', blocking: true });
    }

    if (normalized.unitCost <= 0) {
      warnings.push({ field: `components.${index}.unitCost`, message: 'Component price unavailable; cost estimation may be unreliable.', blocking: false });
    }
  });

  const versionValue = Number(bom.version || 1);
  if (!Number.isFinite(versionValue) || versionValue <= 0) {
    warnings.push({ field: 'version', message: 'BOM version is missing or invalid.', blocking: false });
  }

  const valid = blockingErrors.length === 0;
  return {
    valid,
    blockingErrors,
    warnings,
    summary: valid ? 'No blocking issues.' : `${blockingErrors.length} blocking issue(s) found.`,
  };
}

export function getActiveBomForProduct(productId, boms = []) {
  if (!productId) return null;
  const productBoms = boms.filter((bom) => bom.productId === productId);
  return [...productBoms].sort((a, b) => Number(b.version || 1) - Number(a.version || 1)).find((bom) => bom.status === 'active') || null;
}

export function getBomVersionById(bomId, boms = []) {
  return boms.find((bom) => bom.id === bomId) || null;
}

export function createBom(input = {}, existingBoms = [], inventoryCatalog = []) {
  const productId = input.productId || '';
  const bomCode = input.bomCode || `BOM-${Date.now().toString().slice(-6)}`;
  const nextVersion = Math.max(1, ...existingBoms.filter((bom) => bom.productId === productId).map((bom) => Number(bom.version || 1)), 0) + 1;
  const bom = {
    id: input.id || `BOM-${Date.now().toString().slice(-8)}`,
    productId,
    bomCode,
    version: input.version || nextVersion,
    status: input.status || 'draft',
    outputQuantity: Number(input.outputQuantity ?? 1),
    description: input.description || '',
    components: Array.isArray(input.components) ? input.components.map((component, index) => buildBomComponent(component, index)) : [],
    createdAt: input.createdAt || new Date().toISOString().slice(0, 10),
    updatedAt: input.updatedAt || new Date().toISOString().slice(0, 10),
    isSimulated: true,
  };

  return {
    bom,
    validation: validateBom(bom, existingBoms, inventoryCatalog),
  };
}

export function updateBomDraft(bom = {}, patch = {}) {
  return {
    ...bom,
    ...patch,
    components: Array.isArray(patch.components) ? patch.components.map((component, index) => buildBomComponent(component, index)) : bom.components,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

export function duplicateBomVersion(bom = {}) {
  const nextVersion = Number(bom.version || 1) + 1;
  const duplicateId = `${bom.id}-V${nextVersion}`;

  return {
    ...bom,
    id: duplicateId,
    status: 'draft',
    version: nextVersion,
    bomCode: `${bom.bomCode}-V${nextVersion}`,
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

export function addBomComponent(bom = {}, component = {}) {
  const nextComponent = buildBomComponent(component, (bom.components || []).length);
  return {
    ...bom,
    components: [...(bom.components || []), nextComponent],
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

export function updateBomComponent(bom = {}, componentId, patch = {}) {
  return {
    ...bom,
    components: (bom.components || []).map((component) => component.id === componentId || component.componentId === componentId
      ? buildBomComponent({ ...component, ...patch }, 0)
      : component),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

export function removeBomComponent(bom = {}, componentId) {
  return {
    ...bom,
    components: (bom.components || []).filter((component) => component.id !== componentId && component.componentId !== componentId),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

export function activateBom(bom = {}, existingBoms = [], inventoryCatalog = []) {
  const validation = validateBom(bom, existingBoms, inventoryCatalog);
  if (!validation.valid) {
    return { bom: { ...bom, status: 'draft' }, validation };
  }

  return {
    bom: { ...bom, status: 'active', updatedAt: new Date().toISOString().slice(0, 10) },
    validation,
  };
}

export function archiveBom(bom = {}) {
  return {
    ...bom,
    status: 'archived',
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}
