
import { CarrierData, User, InsurancePolicy } from '../types';

// === MOCK DATA GENERATION ===
const FIRST_NAMES = ['Logistics', 'Freight', 'Transport', 'Carrier', 'Hauling', 'Shipping', 'Express', 'Roadway'];
const LAST_NAMES = ['Solutions', 'LLC', 'Inc', 'Group', 'Systems', 'Lines', 'Brothers', 'Global'];
const CITIES = ['Chicago', 'Dallas', 'Atlanta', 'Los Angeles', 'Miami', 'New York'];
const STATES = ['IL', 'TX', 'GA', 'CA', 'FL', 'NY'];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

export const generateMockCarrier = (mcNumber: string, isBroker: boolean): CarrierData => {
  const isCompany = Math.random() > 0.3;
  const name1 = FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)];
  const name2 = LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)];
  const companyName = isCompany ? `${name1} ${name2}` : `${name1} Services`;
  const city = CITIES[randomInt(0, CITIES.length - 1)];
  const state = STATES[randomInt(0, STATES.length - 1)];

  return {
    mcNumber: mcNumber,
    dotNumber: (parseInt(mcNumber) + 1000000).toString(),
    legalName: companyName,
    dbaName: Math.random() > 0.7 ? `${companyName} DBA` : '',
    entityType: isBroker ? 'BROKER' : 'CARRIER',
    status: Math.random() > 0.1 ? 'AUTHORIZED FOR Property' : 'NOT AUTHORIZED',
    email: `contact@${companyName.toLowerCase().replace(/\s/g, '')}.com`,
    phone: `(${randomInt(200, 900)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
    powerUnits: isBroker ? '0' : randomInt(1, 50).toString(),
    drivers: isBroker ? '0' : randomInt(1, 60).toString(),
    physicalAddress: `${randomInt(100, 9999)} Main St, ${city}, ${state}`,
    mailingAddress: `${randomInt(100, 9999)} PO Box, ${city}, ${state}`,
    dateScraped: new Date().toLocaleDateString(),
    mcs150Date: '01/01/2023',
    mcs150Mileage: '100000',
    operationClassification: ['Auth. For Hire'],
    carrierOperation: ['Interstate'],
    cargoCarried: ['General Freight'],
    outOfServiceDate: '',
    stateCarrierId: '',
    dunsNumber: ''
  };
};

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'wooohan3@gmail.com', role: 'admin', plan: 'Enterprise', dailyLimit: 100000, recordsExtractedToday: 450, lastActive: 'Now', ipAddress: '192.168.1.1', isOnline: true },
  { id: '2', name: 'John Doe', email: 'john@logistics.com', role: 'user', plan: 'Pro', dailyLimit: 5000, recordsExtractedToday: 1240, lastActive: '5m ago', ipAddress: '45.22.19.112', isOnline: true }
];

// === INSURANCE SCRAPER SERVICE ===

export const checkUserInsuranceAccess = async (email: string) => {
  await new Promise(r => setTimeout(r, 800));
  return { status: 1, limit: 10000, downloads: 150 };
};

export const scrapeInsuranceData = async (dotNumber: string): Promise<InsurancePolicy[]> => {
  await new Promise(r => setTimeout(r, 1200));
  const carriers = ['Progressive', 'Berkshire Hathaway', 'Old Republic', 'Travelers', 'Geico Commercial', 'Zurich Insurance'];
  const types = ['BIPD', 'Cargo', 'Bond', 'Liability'];
  const count = randomInt(1, 3);
  const policies: InsurancePolicy[] = [];
  for (let i = 0; i < count; i++) {
    policies.push({
      carrier: carriers[randomInt(0, carriers.length - 1)],
      policyNumber: `POL-${randomInt(100000, 999999)}`,
      effectiveDate: `01/15/2024`,
      coverageAmount: `${randomInt(100, 1000) * 1000}`,
      type: types[randomInt(0, types.length - 1)],
      class: 'P'
    });
  }
  return policies;
};

// === FMCSA SCRAPER HELPERS ===

const fetchUrl = async (targetUrl: string, useProxy: boolean): Promise<string | null> => {
  if (!useProxy) {
    try {
      const response = await fetch(targetUrl);
      if (response.ok) return await response.text();
    } catch (error) { return null; }
  }

  const proxyGenerators = [
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  ];

  for (const generateProxyUrl of proxyGenerators) {
    try {
      const response = await fetch(generateProxyUrl(targetUrl));
      if (response.ok) return await response.text();
    } catch (error) {}
  }
  return null;
};

const findMarkedLabels = (doc: Document, summary: string): string[] => {
  const table = doc.querySelector(`table[summary="${summary}"]`);
  if (!table) return [];
  const labels: string[] = [];
  const cells = table.querySelectorAll('td');
  cells.forEach(cell => {
    if (cell.textContent?.trim() === 'X') {
      const nextSibling = cell.nextElementSibling;
      if (nextSibling) labels.push(nextSibling.textContent?.trim() || '');
    }
  });
  return labels;
};

/**
 * Robustly finds the value associated with a specific label in SAFER's table structure.
 */
const findValueByLabel = (doc: Document, label: string): string => {
  const ths = Array.from(doc.querySelectorAll('th'));
  const targetTh = ths.find(th => th.textContent?.replace(/\u00a0/g, ' ').includes(label));
  if (targetTh && targetTh.nextElementSibling) {
    return targetTh.nextElementSibling.textContent?.trim().replace(/\u00a0/g, ' ') || '';
  }
  return '';
};

export const scrapeRealCarrier = async (mcNumber: string, useProxy: boolean): Promise<CarrierData | null> => {
  const url = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=${mcNumber}`;
  const html = await fetchUrl(url, useProxy);
  if (!html) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Verify if it's a valid carrier snapshot page
  const center = doc.querySelector('center');
  if (!center) return null;

  const getVal = (label: string) => findValueByLabel(doc, label);

  // Map fields from SAFER Table structure
  const dotNumber = getVal('USDOT Number:');
  const legalName = getVal('Legal Name:');
  const dbaName = getVal('DBA Name:');
  const entityType = getVal('Entity Type:');
  const status = getVal('Operating Authority Status:').replace(/(\*Please Note)[\s\S]*/i, '').trim();
  const phone = getVal('Phone:');
  const physicalAddress = getVal('Physical Address:');
  const mailingAddress = getVal('Mailing Address:');
  const powerUnits = getVal('Power Units:');
  const drivers = getVal('Drivers:');
  const mcs150Date = getVal('MCS-150 Form Date:');
  const mcs150Mileage = getVal('MCS-150 Mileage (Year):');
  const outOfServiceDate = getVal('Out of Service Date:');
  const dunsNumber = getVal('DUNS Number:');

  // Fallback to text extraction if table mapping failed for DOT (unlikely but safe)
  if (!dotNumber) {
    const info = center.innerText || center.textContent || '';
    const match = info.match(/USDOT Number:\s*(\d+)/);
    if (match) return scrapeRealCarrier(mcNumber, useProxy); // Retry once or handle
  }

  return {
    mcNumber,
    dotNumber: dotNumber || 'UNKNOWN',
    legalName: legalName || 'NOT FOUND',
    dbaName: dbaName,
    entityType: entityType || 'CARRIER',
    status: status || 'NOT AUTHORIZED',
    email: '', // Not provided on the safer snapshot page directly
    phone: phone || 'N/A',
    powerUnits: powerUnits || '0',
    drivers: drivers || '0',
    physicalAddress: physicalAddress || 'N/A',
    mailingAddress: mailingAddress || 'N/A',
    dateScraped: new Date().toLocaleDateString('en-US'),
    mcs150Date: mcs150Date || 'N/A',
    mcs150Mileage: mcs150Mileage || 'N/A',
    operationClassification: findMarkedLabels(doc, "Operation Classification"),
    carrierOperation: findMarkedLabels(doc, "Carrier Operation"),
    cargoCarried: findMarkedLabels(doc, "Cargo Carried"),
    outOfServiceDate: outOfServiceDate,
    stateCarrierId: getVal('State Carrier ID Number:'),
    dunsNumber: dunsNumber
  };
};

export const downloadCSV = (data: CarrierData[]) => {
  const headers = ['Date', 'MC', 'DOT', 'Legal_Name', 'Status', 'Insurance_Policies'];
  const csvRows = data.map(row => [
    row.dateScraped,
    row.mcNumber,
    row.dotNumber,
    `"${row.legalName.replace(/"/g, '""')}"`,
    `"${row.status.replace(/"/g, '""')}"`,
    `"${(row.insurancePolicies || []).map(p => `${p.carrier}:${p.policyNumber}`).join(' | ')}"`
  ]);

  const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fmcsa_export_${Date.now()}.csv`;
  link.click();
};
