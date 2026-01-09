
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
  // Simulating API check: https://api.catluna.site/mcs/api/check.php
  await new Promise(r => setTimeout(r, 800));
  return { status: 1, limit: 10000, downloads: 150 };
};

export const scrapeInsuranceData = async (dotNumber: string): Promise<InsurancePolicy[]> => {
  // Simulating fetching from https://searchcarriers.com/company/{dot}/insurances
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

export const scrapeRealCarrier = async (mcNumber: string, useProxy: boolean): Promise<CarrierData | null> => {
  const url = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=${mcNumber}`;
  const html = await fetchUrl(url, useProxy);
  if (!html) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const center = doc.querySelector('center');
  if (!center) return null;

  let crawlDate = new Date().toLocaleDateString('en-US');
  const information = center.innerText || center.textContent || '';

  let entityType = '';
  let status = '';
  const ths = doc.querySelectorAll('th');
  ths.forEach(th => {
    if (th.textContent?.includes('Entity Type:')) entityType = th.nextElementSibling?.textContent?.trim() || '';
    if (th.textContent?.includes('Operating Authority Status:')) status = th.nextElementSibling?.textContent?.trim() || '';
  });

  const extract = (pattern: RegExp): string => {
    const match = information.match(pattern);
    return match && match[1] ? match[1].trim() : '';
  };

  const dotNumber = extract(/USDOT Number:(.*?)State Carrier ID Number/);

  return {
    mcNumber,
    dotNumber,
    legalName: extract(/Legal Name:(.*?)DBA/),
    dbaName: extract(/DBA Name:(.*?)Physical Address/),
    entityType,
    status: status.replace(/(\*Please Note)[\s\S]*/i, '').trim(),
    email: '', // Requires separate SMS fetch in real implementation
    phone: extract(/Phone:(.*?)Mailing Address/),
    powerUnits: extract(/Power Units:(.*?)Drivers/),
    drivers: extract(/Drivers:(.*?)MCS-150 Form Date/),
    physicalAddress: extract(/Physical Address:(.*?)Phone/),
    mailingAddress: extract(/Mailing Address:(.*?)USDOT/),
    dateScraped: crawlDate,
    mcs150Date: extract(/MCS-150 Form Date:(.*?)MCS/),
    mcs150Mileage: extract(/MCS-150 Mileage \(Year\):(.*?)(?:Operation Classification|$)/).replace('Operation Classification:', '').trim(),
    operationClassification: findMarkedLabels(doc, "Operation Classification"),
    carrierOperation: findMarkedLabels(doc, "Carrier Operation"),
    cargoCarried: findMarkedLabels(doc, "Cargo Carried"),
    outOfServiceDate: extract(/Out of Service Date:(.*?)Legal Name/),
    stateCarrierId: '',
    dunsNumber: extract(/DUNS Number:(.*?)Power Units/)
  };
};

export const downloadCSV = (data: CarrierData[]) => {
  const headers = ['Date', 'MC', 'DOT', 'Legal_Name', 'Insurance_Policies'];
  const csvRows = data.map(row => [
    row.dateScraped,
    row.mcNumber,
    row.dotNumber,
    `"${row.legalName.replace(/"/g, '""')}"`,
    `"${(row.insurancePolicies || []).map(p => `${p.carrier}:${p.policyNumber}`).join(' | ')}"`
  ]);

  const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `export_${Date.now()}.csv`;
  link.click();
};
