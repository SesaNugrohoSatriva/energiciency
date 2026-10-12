import { generateProductionData, generateProductionOrders } from './generators/productionGenerator';
import { generateEnergyData, generateEnergyProcessData } from './generators/energyGenerator';
import { generateInventoryData } from './generators/inventoryGenerator';
import { generateCostingData } from './generators/costingGenerator';
import { calculateAverageOEE, calculateOEE } from '../utils/oeeCalculator';
import { calculateProductCost } from '../utils/costingCalculator';

export const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Production Order', path: '/production-orders' },
  { label: 'Produk', path: '/products' },
  { label: 'Monitoring Energi', path: '/energy-monitoring' },
  { label: 'Performa Mesin', path: '/machine-performance' },
  { label: 'Costing', path: '/costing' },
  { label: 'Persediaan', path: '/inventory' },
  { label: 'Laporan', path: '/reports' },
];

const machineCatalog = [
  { id: 'M-101', machineCode: 'MECH-01', name: 'Mechanical Assembly Workstation', machineCategory: 'Mechanical', processIds: ['PROC-01', 'PROC-02'], supportedProcesses: ['PROC-01', 'PROC-02'], productIds: ['PRD-1001', 'PRD-1002', 'PRD-1003', 'PRD-1004', 'PRD-1005'], hourlyOperatingCost: 420000, nominalPowerKw: 10.5, targetOee: 0.82, status: 'Normal', isSimulated: true },
  { id: 'M-102', machineCode: 'ELEC-01', name: 'Electrical Assembly Workstation', machineCategory: 'Electrical', processIds: ['PROC-03'], supportedProcesses: ['PROC-03'], productIds: ['PRD-1001', 'PRD-1002', 'PRD-1003', 'PRD-1004', 'PRD-1005'], hourlyOperatingCost: 390000, nominalPowerKw: 9.2, targetOee: 0.8, status: 'Normal', isSimulated: true },
  { id: 'M-103', machineCode: 'CTRL-01', name: 'Control Integration Workstation', machineCategory: 'Control', processIds: ['PROC-04'], supportedProcesses: ['PROC-04'], productIds: ['PRD-1001', 'PRD-1002', 'PRD-1003', 'PRD-1004'], hourlyOperatingCost: 465000, nominalPowerKw: 11.8, targetOee: 0.85, status: 'Normal', isSimulated: true },
  { id: 'M-104', machineCode: 'CAL-01', name: 'Calibration Workstation', machineCategory: 'Calibration', processIds: ['PROC-05'], supportedProcesses: ['PROC-05'], productIds: ['PRD-1001', 'PRD-1003'], hourlyOperatingCost: 440000, nominalPowerKw: 12.1, targetOee: 0.78, status: 'Monitor', isSimulated: true },
  { id: 'M-105', machineCode: 'TEST-01', name: 'Functional Test Workstation', machineCategory: 'Test', processIds: ['PROC-06'], supportedProcesses: ['PROC-06'], productIds: ['PRD-1001', 'PRD-1002', 'PRD-1003'], hourlyOperatingCost: 430000, nominalPowerKw: 8.7, targetOee: 0.88, status: 'Normal', isSimulated: true },
  { id: 'M-106', machineCode: 'QC-01', name: 'Final Inspection Workstation', machineCategory: 'Quality', processIds: ['PROC-06'], supportedProcesses: ['PROC-06'], productIds: ['PRD-1004', 'PRD-1005'], hourlyOperatingCost: 360000, nominalPowerKw: 6.8, targetOee: 0.9, status: 'Normal', isSimulated: true },
];

const processCatalog = [
  { id: 'PROC-01', name: 'Component preparation', machineIds: ['M-101'], energyKwh: 36 },
  { id: 'PROC-02', name: 'Mechanical assembly', machineIds: ['M-101'], energyKwh: 42 },
  { id: 'PROC-03', name: 'Electrical assembly', machineIds: ['M-102'], energyKwh: 28 },
  { id: 'PROC-04', name: 'Control-system integration', machineIds: ['M-103'], energyKwh: 31 },
  { id: 'PROC-05', name: 'Calibration and configuration', machineIds: ['M-104'], energyKwh: 24 },
  { id: 'PROC-06', name: 'Functional testing and inspection', machineIds: ['M-105', 'M-106'], energyKwh: 18 },
];

const productCatalog = [
  {
    id: 'PRD-1001',
    sku: 'SIM-VENT-001',
    name: 'ICU Ventilator',
    category: 'Medical Device',
    description: 'Illustrative simulation inspired by publicly presented STECHOQ ICU Ventilator concepts. This product record is not an official STECHOQ specification and is intended only for demo analytics in Energiciency.',
    uom: 'unit',
    unitOfMeasure: 'unit',
    simulationStatus: 'Illustrative simulation – not official company data',
    estimatedStandardCost: 182000000,
    materialCost: 83000000,
    laborCost: 28000000,
    energyCost: 9000000,
    overheadCost: 24000000,
    standardProductionTime: 28800,
    routingId: 'RT-VENT-001',
    bomId: 'BOM-VENT-001',
    createdAt: '2025-01-10',
    updatedAt: '2025-02-01',
    batchSize: 8,
    status: 'Active',
    bom: [
      { componentId: 'CMP-VENT-01', productId: 'PRD-1001', componentName: 'Structural frame assembly', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 28000000, supplierName: 'Illustrative supplier', isSimulated: true },
      { componentId: 'CMP-VENT-02', productId: 'PRD-1001', componentName: 'Flow control module', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 35000000, supplierName: 'Illustrative supplier', isSimulated: true },
      { componentId: 'CMP-VENT-03', productId: 'PRD-1001', componentName: 'Control electronics', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 22000000, supplierName: 'Illustrative supplier', isSimulated: true },
    ],
    routing: [
      { id: 'ROUT-101', sequence: 1, name: 'Component preparation', machineId: 'M-101', processId: 'PROC-01', idealCycleTime: 540, setupTime: 60, expectedOutput: 8, expectedEnergyKwh: 7.8, laborRequirement: 2.5, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-102', sequence: 2, name: 'Mechanical assembly', machineId: 'M-101', processId: 'PROC-02', idealCycleTime: 720, setupTime: 75, expectedOutput: 8, expectedEnergyKwh: 11.1, laborRequirement: 3.1, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-103', sequence: 3, name: 'Electrical assembly', machineId: 'M-102', processId: 'PROC-03', idealCycleTime: 600, setupTime: 68, expectedOutput: 8, expectedEnergyKwh: 9.4, laborRequirement: 3.6, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-104', sequence: 4, name: 'Control-system integration', machineId: 'M-103', processId: 'PROC-04', idealCycleTime: 540, setupTime: 70, expectedOutput: 8, expectedEnergyKwh: 10.8, laborRequirement: 2.9, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-105', sequence: 5, name: 'Calibration and configuration', machineId: 'M-104', processId: 'PROC-05', idealCycleTime: 480, setupTime: 80, expectedOutput: 8, expectedEnergyKwh: 8.6, laborRequirement: 2.7, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-106', sequence: 6, name: 'Functional testing and inspection', machineId: 'M-105', processId: 'PROC-06', idealCycleTime: 420, setupTime: 55, expectedOutput: 8, expectedEnergyKwh: 7.4, laborRequirement: 2.3, notes: 'Simulation assumption for functional validation and QA pass.' },
    ],
    targetOee: 0.82,
  },
  {
    id: 'PRD-1002',
    sku: 'SIM-MPPS-001',
    name: 'Mini-Plan Production System',
    category: 'Automation System',
    description: 'Illustrative simulation based on the publicly presented Mini-Plan Production System. This is a demo manufacturing model and not a verified STECHOQ production blueprint.',
    uom: 'unit',
    unitOfMeasure: 'unit',
    simulationStatus: 'Illustrative simulation – not official company data',
    estimatedStandardCost: 126000000,
    materialCost: 54000000,
    laborCost: 26000000,
    energyCost: 7800000,
    overheadCost: 18000000,
    standardProductionTime: 21600,
    routingId: 'RT-MPPS-001',
    bomId: 'BOM-MPPS-001',
    createdAt: '2025-01-12',
    updatedAt: '2025-02-05',
    batchSize: 10,
    status: 'Active',
    bom: [
      { componentId: 'CMP-MPPS-01', productId: 'PRD-1002', componentName: 'Linear motion frame', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 19000000, supplierName: 'Illustrative supplier', isSimulated: true },
      { componentId: 'CMP-MPPS-02', productId: 'PRD-1002', componentName: 'Drive and control cabinet', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 20000000, supplierName: 'Illustrative supplier', isSimulated: true },
      { componentId: 'CMP-MPPS-03', productId: 'PRD-1002', componentName: 'Sensor and interface kit', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 16000000, supplierName: 'Illustrative supplier', isSimulated: true },
    ],
    routing: [
      { id: 'ROUT-201', sequence: 1, name: 'Component preparation', machineId: 'M-101', processId: 'PROC-01', idealCycleTime: 480, setupTime: 55, expectedOutput: 10, expectedEnergyKwh: 6.8, laborRequirement: 2.0, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-202', sequence: 2, name: 'Mechanical assembly', machineId: 'M-101', processId: 'PROC-02', idealCycleTime: 660, setupTime: 70, expectedOutput: 10, expectedEnergyKwh: 8.7, laborRequirement: 2.8, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-203', sequence: 3, name: 'Electrical assembly', machineId: 'M-102', processId: 'PROC-03', idealCycleTime: 520, setupTime: 60, expectedOutput: 10, expectedEnergyKwh: 7.5, laborRequirement: 2.5, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-204', sequence: 4, name: 'Control-system integration', machineId: 'M-103', processId: 'PROC-04', idealCycleTime: 480, setupTime: 62, expectedOutput: 10, expectedEnergyKwh: 9.2, laborRequirement: 2.9, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-205', sequence: 5, name: 'Functionality test and inspection', machineId: 'M-105', processId: 'PROC-06', idealCycleTime: 450, setupTime: 58, expectedOutput: 10, expectedEnergyKwh: 7.1, laborRequirement: 2.3, notes: 'Simulation assumption for end-of-line checks.' },
    ],
    targetOee: 0.84,
  },
  {
    id: 'PRD-1003',
    sku: 'SIM-DCS-001',
    name: 'Digital Control System',
    category: 'Control System',
    description: 'Simulation model derived from publicly presented STECHOQ digital control system offerings. It is used for demonstration analytics only and not as an official product specification.',
    uom: 'unit',
    unitOfMeasure: 'unit',
    simulationStatus: 'Illustrative simulation – not official company data',
    estimatedStandardCost: 98000000,
    materialCost: 44000000,
    laborCost: 21000000,
    energyCost: 6800000,
    overheadCost: 16000000,
    standardProductionTime: 18000,
    routingId: 'RT-DCS-001',
    bomId: 'BOM-DCS-001',
    createdAt: '2025-01-14',
    updatedAt: '2025-02-10',
    batchSize: 12,
    status: 'Active',
    bom: [
      { componentId: 'CMP-DCS-01', productId: 'PRD-1003', componentName: 'Embedded controller board', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 17000000, supplierName: 'Illustrative supplier', isSimulated: true },
      { componentId: 'CMP-DCS-02', productId: 'PRD-1003', componentName: 'Signal conditioning harness', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 12000000, supplierName: 'Illustrative supplier', isSimulated: true },
      { componentId: 'CMP-DCS-03', productId: 'PRD-1003', componentName: 'Human-machine interface panel', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 14000000, supplierName: 'Illustrative supplier', isSimulated: true },
    ],
    routing: [
      { id: 'ROUT-301', sequence: 1, name: 'Component preparation', machineId: 'M-101', processId: 'PROC-01', idealCycleTime: 420, setupTime: 40, expectedOutput: 12, expectedEnergyKwh: 5.2, laborRequirement: 1.8, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-302', sequence: 2, name: 'Electrical assembly', machineId: 'M-102', processId: 'PROC-03', idealCycleTime: 540, setupTime: 55, expectedOutput: 12, expectedEnergyKwh: 7.1, laborRequirement: 2.4, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-303', sequence: 3, name: 'Control-system integration', machineId: 'M-103', processId: 'PROC-04', idealCycleTime: 500, setupTime: 58, expectedOutput: 12, expectedEnergyKwh: 8.1, laborRequirement: 2.9, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-304', sequence: 4, name: 'Calibration and configuration', machineId: 'M-104', processId: 'PROC-05', idealCycleTime: 480, setupTime: 66, expectedOutput: 12, expectedEnergyKwh: 7.4, laborRequirement: 2.0, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-305', sequence: 5, name: 'Functional testing and inspection', machineId: 'M-105', processId: 'PROC-06', idealCycleTime: 390, setupTime: 50, expectedOutput: 12, expectedEnergyKwh: 6.3, laborRequirement: 2.0, notes: 'Simulation assumption for functional validation and QA pass.' },
    ],
    targetOee: 0.86,
  },
  {
    id: 'PRD-1004',
    sku: 'SIM-FLOAMS-001',
    name: 'FloAms',
    category: 'Process Automation',
    description: 'Simulation inspired by the publicly presented FloAms platform. It showcases an illustrative manufacturing model for demo reporting and does not claim official STECHOQ component data.',
    uom: 'unit',
    unitOfMeasure: 'unit',
    simulationStatus: 'Illustrative simulation – not official company data',
    estimatedStandardCost: 114000000,
    materialCost: 50000000,
    laborCost: 22000000,
    energyCost: 7600000,
    overheadCost: 17000000,
    standardProductionTime: 21600,
    routingId: 'RT-FLOAMS-001',
    bomId: 'BOM-FLOAMS-001',
    createdAt: '2025-01-18',
    updatedAt: '2025-02-08',
    batchSize: 7,
    status: 'Active',
    bom: [
      { componentId: 'CMP-FLOAMS-01', productId: 'PRD-1004', componentName: 'Modular sensing frame', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 21000000, supplierName: 'Illustrative supplier', isSimulated: true },
      { componentId: 'CMP-FLOAMS-02', productId: 'PRD-1004', componentName: 'Actuation subassembly', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 18000000, supplierName: 'Illustrative supplier', isSimulated: true },
      { componentId: 'CMP-FLOAMS-03', productId: 'PRD-1004', componentName: 'Monitoring electronics', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 11000000, supplierName: 'Illustrative supplier', isSimulated: true },
    ],
    routing: [
      { id: 'ROUT-401', sequence: 1, name: 'Component preparation', machineId: 'M-101', processId: 'PROC-01', idealCycleTime: 460, setupTime: 52, expectedOutput: 7, expectedEnergyKwh: 6.0, laborRequirement: 1.9, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-402', sequence: 2, name: 'Mechanical assembly', machineId: 'M-101', processId: 'PROC-02', idealCycleTime: 640, setupTime: 76, expectedOutput: 7, expectedEnergyKwh: 8.3, laborRequirement: 2.7, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-403', sequence: 3, name: 'Electrical assembly', machineId: 'M-102', processId: 'PROC-03', idealCycleTime: 520, setupTime: 58, expectedOutput: 7, expectedEnergyKwh: 7.4, laborRequirement: 2.2, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-404', sequence: 4, name: 'Control-system integration', machineId: 'M-103', processId: 'PROC-04', idealCycleTime: 500, setupTime: 64, expectedOutput: 7, expectedEnergyKwh: 7.8, laborRequirement: 2.4, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-405', sequence: 5, name: 'Functional testing and inspection', machineId: 'M-106', processId: 'PROC-06', idealCycleTime: 410, setupTime: 45, expectedOutput: 7, expectedEnergyKwh: 5.8, laborRequirement: 1.8, notes: 'Simulation assumption for end-of-line validation.' },
    ],
    targetOee: 0.83,
  },
  {
    id: 'PRD-1005',
    sku: 'SIM-APE-001',
    name: 'Alat Peraga Pendidikan',
    category: 'Education Product',
    description: 'This simulated educational product is inspired by publicly presented STECHOQ educational equipment. It is intended to demonstrate dashboard analytics and is not a formal STECHOQ product specification.',
    uom: 'unit',
    unitOfMeasure: 'unit',
    simulationStatus: 'Illustrative simulation – not official company data',
    estimatedStandardCost: 65000000,
    materialCost: 29000000,
    laborCost: 15000000,
    energyCost: 4200000,
    overheadCost: 11000000,
    standardProductionTime: 12600,
    routingId: 'RT-APE-001',
    bomId: 'BOM-APE-001',
    createdAt: '2025-01-20',
    updatedAt: '2025-02-12',
    batchSize: 15,
    status: 'Active',
    bom: [
      { componentId: 'CMP-APE-01', productId: 'PRD-1005', componentName: 'Learning module frame', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 9800000, supplierName: 'Illustrative supplier', isSimulated: true },
      { componentId: 'CMP-APE-02', productId: 'PRD-1005', componentName: 'Sensor and indicator kit', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 7600000, supplierName: 'Illustrative supplier', isSimulated: true },
      { componentId: 'CMP-APE-03', productId: 'PRD-1005', componentName: 'Educational control board', quantityPerUnit: 1, unitOfMeasure: 'set', unitPrice: 8200000, supplierName: 'Illustrative supplier', isSimulated: true },
    ],
    routing: [
      { id: 'ROUT-501', sequence: 1, name: 'Component preparation', machineId: 'M-101', processId: 'PROC-01', idealCycleTime: 360, setupTime: 35, expectedOutput: 15, expectedEnergyKwh: 4.8, laborRequirement: 1.3, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-502', sequence: 2, name: 'Mechanical assembly', machineId: 'M-101', processId: 'PROC-02', idealCycleTime: 420, setupTime: 42, expectedOutput: 15, expectedEnergyKwh: 5.4, laborRequirement: 1.5, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-503', sequence: 3, name: 'Electrical assembly', machineId: 'M-102', processId: 'PROC-03', idealCycleTime: 390, setupTime: 45, expectedOutput: 15, expectedEnergyKwh: 4.7, laborRequirement: 1.3, notes: 'Illustrative manufacturing routing — requires validation against actual company processes.' },
      { id: 'ROUT-504', sequence: 4, name: 'Functional testing and inspection', machineId: 'M-106', processId: 'PROC-06', idealCycleTime: 310, setupTime: 38, expectedOutput: 15, expectedEnergyKwh: 4.1, laborRequirement: 1.6, notes: 'Simulation assumption for educational equipment verification.' },
    ],
    targetOee: 0.89,
  },
];

const baseProductionOrders = [
  { id: 'PO-3001', productId: 'PRD-1001', status: 'In Progress', progress: 68, quantity: 24, plannedOutput: 24, actualOutput: 18, goodOutput: 17, date: '2025-02-03' },
  { id: 'PO-3002', productId: 'PRD-1002', status: 'Completed', progress: 100, quantity: 18, plannedOutput: 18, actualOutput: 18, goodOutput: 18, date: '2025-02-10' },
  { id: 'PO-3003', productId: 'PRD-1003', status: 'Planned', progress: 25, quantity: 15, plannedOutput: 15, actualOutput: 4, goodOutput: 3, date: '2025-02-15' },
  { id: 'PO-3004', productId: 'PRD-1004', status: 'Delayed', progress: 42, quantity: 20, plannedOutput: 20, actualOutput: 11, goodOutput: 10, date: '2025-02-20' },
  { id: 'PO-3005', productId: 'PRD-1001', status: 'Completed', progress: 100, quantity: 24, plannedOutput: 24, actualOutput: 24, goodOutput: 24, date: '2025-02-24' },
  { id: 'PO-3006', productId: 'PRD-1002', status: 'In Progress', progress: 74, quantity: 18, plannedOutput: 18, actualOutput: 15, goodOutput: 14, date: '2025-02-27' },
];

const oeeTrend = [
  { machineId: 'M-101', date: '2025-01-05', plannedProductionTime: 480, operatingTime: 430, idealCycleTime: 0.42, totalOutput: 980, goodOutput: 936 },
  { machineId: 'M-101', date: '2025-01-12', plannedProductionTime: 480, operatingTime: 440, idealCycleTime: 0.42, totalOutput: 1010, goodOutput: 962 },
  { machineId: 'M-101', date: '2025-01-19', plannedProductionTime: 480, operatingTime: 415, idealCycleTime: 0.42, totalOutput: 975, goodOutput: 923 },
  { machineId: 'M-102', date: '2025-01-05', plannedProductionTime: 480, operatingTime: 410, idealCycleTime: 0.46, totalOutput: 840, goodOutput: 806 },
  { machineId: 'M-102', date: '2025-01-12', plannedProductionTime: 480, operatingTime: 440, idealCycleTime: 0.46, totalOutput: 890, goodOutput: 867 },
  { machineId: 'M-102', date: '2025-01-19', plannedProductionTime: 480, operatingTime: 410, idealCycleTime: 0.46, totalOutput: 820, goodOutput: 795 },
  { machineId: 'M-103', date: '2025-01-05', plannedProductionTime: 480, operatingTime: 425, idealCycleTime: 0.5, totalOutput: 865, goodOutput: 831 },
  { machineId: 'M-103', date: '2025-01-12', plannedProductionTime: 480, operatingTime: 448, idealCycleTime: 0.5, totalOutput: 890, goodOutput: 855 },
  { machineId: 'M-103', date: '2025-01-19', plannedProductionTime: 480, operatingTime: 436, idealCycleTime: 0.5, totalOutput: 882, goodOutput: 844 },
  { machineId: 'M-104', date: '2025-01-05', plannedProductionTime: 480, operatingTime: 392, idealCycleTime: 0.6, totalOutput: 640, goodOutput: 612 },
  { machineId: 'M-104', date: '2025-01-12', plannedProductionTime: 480, operatingTime: 410, idealCycleTime: 0.6, totalOutput: 670, goodOutput: 640 },
  { machineId: 'M-104', date: '2025-01-19', plannedProductionTime: 480, operatingTime: 382, idealCycleTime: 0.6, totalOutput: 610, goodOutput: 569 },
  { machineId: 'M-105', date: '2025-01-05', plannedProductionTime: 480, operatingTime: 450, idealCycleTime: 0.41, totalOutput: 1090, goodOutput: 1057 },
  { machineId: 'M-105', date: '2025-01-12', plannedProductionTime: 480, operatingTime: 456, idealCycleTime: 0.41, totalOutput: 1125, goodOutput: 1102 },
  { machineId: 'M-105', date: '2025-01-19', plannedProductionTime: 480, operatingTime: 448, idealCycleTime: 0.41, totalOutput: 1095, goodOutput: 1062 },
];

const maintenanceLogs = [
  { machineId: 'M-104', issue: 'Calibration drift detected', date: '2025-02-06', priority: 'High', status: 'Open', notes: 'Load testing shows repeated offset variance.' },
  { machineId: 'M-102', issue: 'Minor stoppage pattern', date: '2025-02-12', priority: 'Medium', status: 'Monitor', notes: 'Tool changeover frequency increased by 12%.' },
  { machineId: 'M-103', issue: 'Sensor alignment check', date: '2025-02-18', priority: 'Low', status: 'Planned', notes: 'Timing drift recorded in control integration stage.' },
];

function withOee(records) {
  return records.map((record) => {
    const result = calculateOEE({
      operatingTime: record.operatingTime,
      plannedProductionTime: record.plannedProductionTime,
      idealCycleTime: record.idealCycleTime,
      totalOutput: record.totalOutput,
      goodOutput: record.goodOutput,
    });

    return {
      ...record,
      ...result,
      oee: result.oee,
      availability: result.availability,
      performance: result.performance,
      quality: result.quality,
    };
  });
}

export function buildMockData() {
  const productionData = generateProductionData({ months: 6 });
  const energyData = generateEnergyData({ days: 14 });
  const productionOrders = generateProductionOrders({ count: 8 }).map((order, index) => {
    const product = productCatalog[index % productCatalog.length];
    return {
      ...order,
      productId: product.id,
      productName: product.name,
      plannedQuantity: order.quantity,
      status: order.status,
    };
  });

  const inventory = generateInventoryData({ count: 9 });
  const costing = generateCostingData({ months: 6 });
  const energyProcessData = generateEnergyProcessData();

  const enrichedOee = withOee(oeeTrend);
  const machinePerformance = machineCatalog.map((machine) => {
    const records = enrichedOee.filter((item) => item.machineId === machine.id);
    const averageOee = calculateAverageOEE(records);
    const latestRecord = records[records.length - 1] || null;
    const downtime = records.reduce((sum, item) => sum + (Number(item.plannedProductionTime) - Number(item.operatingTime)), 0);
    const breakdownEvents = Math.max(1, Math.round((1 - (averageOee || 0.7)) * 10));

    return {
      machineId: machine.id,
      machineName: machine.name,
      latestOee: latestRecord ? latestRecord.oee : null,
      averageOee,
      availability: latestRecord ? latestRecord.availability : null,
      performance: latestRecord ? latestRecord.performance : null,
      quality: latestRecord ? latestRecord.quality : null,
      totalDowntime: downtime,
      breakdownEvents,
      status: (latestRecord && latestRecord.oee >= 0.85) ? 'Normal' : (latestRecord && latestRecord.oee >= 0.6) ? 'Monitor' : 'Investigate',
      recommendedAction: (latestRecord && latestRecord.oee < 0.6) ? 'Maintenance review recommended' : (latestRecord && latestRecord.oee < 0.85) ? 'Monitor and inspect losses' : 'Normal operation',
      processIds: machine.processIds || machine.supportedProcesses || [],
      productIds: machine.productIds || [],
      trend: records.map((record) => ({
        label: record.date,
        oee: record.oee,
        availability: record.availability,
        performance: record.performance,
        quality: record.quality,
      })),
    };
  });

  const processPerformance = processCatalog.map((process) => {
    const records = enrichedOee.filter((item) => {
      if (!item.machineId) return false;
      const machine = machineCatalog.find((candidate) => candidate.id === item.machineId);
      return Boolean(machine && Array.isArray(machine.processIds) && machine.processIds.includes(process.id));
    });
    const averageOee = calculateAverageOEE(records);
    const downtime = records.reduce((sum, item) => sum + (item.plannedProductionTime - item.operatingTime), 0);

    return {
      processId: process.id,
      processName: process.name,
      machineIds: process.machineIds,
      averageOee,
      downtime,
      availability: averageOee ? 0.91 : null,
      performance: averageOee ? 0.94 : null,
      quality: averageOee ? 0.97 : null,
      oee: averageOee,
      energyKwh: process.energyKwh,
      cost: process.energyKwh * 1650,
    };
  });

  const productPerformance = productCatalog.map((product) => {
    const productOrders = baseProductionOrders.filter((order) => order.productId === product.id);
    const totalQuantity = productOrders.reduce((sum, order) => sum + Number(order.actualOutput || order.quantity || 0), 0);
    const goodQuantity = productOrders.reduce((sum, order) => sum + Number(order.goodOutput || 0), 0);
    const costSummary = calculateProductCost({
      bom: product.bom,
      routing: product.routing,
      batchQuantity: product.batchSize,
      energyTariff: 1650,
      laborRate: 75000,
      machineOperatingRate: 42000,
      overheadRate: 0.12,
    });

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      orders: productOrders.length,
      totalQuantity,
      goodQuantity,
      averageEnergyPerUnit: totalQuantity ? (product.routing.reduce((sum, item) => sum + Number(item.expectedEnergyKwh || 0), 0) / totalQuantity) : 0,
      totalEnergy: product.routing.reduce((sum, item) => sum + Number(item.expectedEnergyKwh || 0), 0),
      totalCost: costSummary.totalBatchCost,
      costPerGoodUnit: goodQuantity ? costSummary.totalBatchCost / goodQuantity : costSummary.costPerUnit,
      targetOee: product.targetOee,
      oee: costSummary.totalBatchCost ? (product.targetOee || 0.84) : 0.84,
    };
  });

  const bomSeed = productCatalog.map((product, index) => {
    const components = (product.bom || []).map((component, componentIndex) => ({
      id: component.componentId || `CMP-${index + 1}-${componentIndex + 1}`,
      componentCode: component.componentId || `CMP-${index + 1}-${componentIndex + 1}`,
      componentId: component.componentId || `CMP-${index + 1}-${componentIndex + 1}`,
      componentName: component.componentName || `Component ${componentIndex + 1}`,
      inventorySku: `INV-${String(100 + index + componentIndex).padStart(3, '0')}`,
      inventoryName: component.componentName || `Component ${componentIndex + 1}`,
      quantity: Number(component.quantityPerUnit || 1),
      quantityPerUnit: Number(component.quantityPerUnit || 1),
      unitOfMeasure: component.unitOfMeasure || 'set',
      unitCost: Number(component.unitPrice || 0),
      unitPrice: Number(component.unitPrice || 0),
      scrapRate: Number(component.scrapRate || 2),
      notes: component.notes || 'Simulated component',
      isSimulated: true,
    }));

    return {
      id: product.bomId || `BOM-${String(index + 1).padStart(3, '0')}`,
      productId: product.id,
      bomCode: product.bomId || `BOM-${String(index + 1).padStart(3, '0')}`,
      version: 1,
      status: 'active',
      outputQuantity: Number(product.batchSize || 1),
      description: `Active BOM for ${product.name}`,
      components,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      isSimulated: true,
    };
  });

  const products = productCatalog.map((product) => ({
    ...product,
    bomId: product.bomId || 'BOM-DEFAULT',
    estimatedCost: calculateProductCost({
      bom: product.bom,
      routing: product.routing,
      batchQuantity: product.batchSize,
      energyTariff: 1650,
      laborRate: 75000,
      machineOperatingRate: 42000,
      overheadRate: 0.12,
    }).totalBatchCost,
  }));

  const dashboardKpis = [
    { label: 'Total Produksi', value: '486', unit: 'unit', note: '↑ 12.4% dari bulan lalu', tone: 'positive' },
    { label: 'Konsumsi Energi', value: '1.284', unit: 'kWh', note: '↓ 4.2% dari bulan lalu', tone: 'neutral' },
    { label: 'Biaya Energi', value: 'Rp1,92 jt', note: 'Rp3.950 / unit', tone: 'neutral' },
    { label: 'Efisiensi Produksi', value: '87.6%', note: '↑ 6.1% from target', tone: 'positive' },
  ];

  const normalizedOrders = [...productionOrders, ...baseProductionOrders].map((order) => ({
    ...order,
    product: order.product || productCatalog.find((item) => item.id === order.productId)?.name || 'Unknown product',
    priority: order.priority || 'Medium',
    energy: order.energy || `${(Number(order.quantity || 0) * 1.8).toFixed(1)} kWh`,
    cost: order.cost || `Rp${(Number(order.quantity || 0) * 185000).toLocaleString('id-ID')}`,
  }));

  const boms = bomSeed.map((bom) => ({
    ...bom,
    components: bom.components.map((component) => ({
      ...component,
      quantity: Number(component.quantity ?? component.quantityPerUnit ?? 1),
      unitPrice: Number(component.unitPrice ?? component.unitCost ?? 0),
      unitCost: Number(component.unitCost ?? component.unitPrice ?? 0),
    })),
  }));

  return {
    machines: machineCatalog,
    processes: processCatalog,
    products,
    boms,
    orders: normalizedOrders,
    productionOrders: normalizedOrders,
    inventory,
    costing,
    dashboardKpis,
    energyProcessData,
    energyData,
    productionData,
    reportsTrend: [
      { label: 'Jan', output: 320, energy: 520, efficiency: 86 },
      { label: 'Feb', output: 340, energy: 545, efficiency: 87 },
      { label: 'Mar', output: 360, energy: 560, efficiency: 88 },
      { label: 'Apr', output: 410, energy: 610, efficiency: 89 },
      { label: 'Mei', output: 450, energy: 640, efficiency: 90 },
      { label: 'Jun', output: 486, energy: 680, efficiency: 91 },
    ],
    machinePerformance,
    processPerformance,
    productPerformance,
    maintenanceLogs,
    oeeTarget: 0.85,
    historicalAverageOee: 0.78,
    productionProgress: { current: 68, target: 35, actual: 24, oee: 87.6, machine: 'Lengan Robot R-06', shift: 'Shift Pagi', completion: '15:30' },
  };
}

export const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
export const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(value);
export const formatEnergy = (value) => `${formatNumber(value)} kWh`;
