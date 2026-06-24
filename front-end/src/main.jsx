import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3,
  BookOpenCheck,
  Building2,
  CreditCard,
  Download,
  Edit3,
  FileText,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogIn,
  LogOut,
  MapPinned,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import './styles.css';

const AUTH_STORAGE_KEY = 'olw.auth.session';
const BACKEND_BASE_URL = 'http://207.180.223.140:9999/';
const emptyZoneForm = { name: '', leaderName: '', leaderPhone: '' };
const emptyMemberForm = {
  membershipNo: '',
  zoneId: '',
  sectionId: '',
  massCentreId: '',
  surname: '',
  firstNames: '',
  homeAddress: '',
  emailAddress: '',
  telephone: '',
  cell: '',
  baptismPlace: '',
  baptismDate: '',
  confirmationDate: '',
  marriageDate: '',
  parishPriestName: '',
  dateOfIssue: '',
  status: 'ACTIVE',
};
const memberStatuses = ['ACTIVE', 'INACTIVE', 'DECEASED', 'TRANSFERRED'];
const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const billingFrequencies = ['MONTHLY', 'YEARLY', 'ONCE_OFF'];
const billingAppliesTo = ['ALL_MEMBERS', 'ZONE', 'GUILD', 'INDIVIDUAL'];
const billingItemStatuses = ['ACTIVE', 'INACTIVE'];
const billStatuses = ['PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'];
const currentYear = new Date().getFullYear();
const currentMonth = months[new Date().getMonth()];
const emptyBillingItemForm = {
  name: '',
  description: '',
  amount: '',
  currency: 'USD',
  frequency: 'MONTHLY',
  appliesTo: 'ALL_MEMBERS',
  year: String(currentYear),
  month: currentMonth,
  status: 'ACTIVE',
};
const emptyBillingRunForm = {
  billingItemId: '',
  year: String(currentYear),
  month: currentMonth,
  zoneId: '',
  guildId: '',
  memberId: '',
};
const paymentMethods = ['CASH', 'ECOCASH', 'ONEMONEY', 'BANK_TRANSFER', 'POS', 'SWIPE', 'OTHER'];
const todayIso = new Date().toISOString().slice(0, 10);
const emptyPaymentForm = {
  memberId: '',
  currency: 'USD',
  paymentMethod: 'CASH',
  paymentReference: '',
  paymentDate: todayIso,
  notes: '',
};
const reportTabs = [
  { key: 'dailyCollections', label: 'Daily collections', description: 'Total collections for one date.' },
  { key: 'monthlyCollections', label: 'Monthly collections', description: 'Total collections for a selected month.' },
  { key: 'yearlyCollections', label: 'Yearly collections', description: 'Total collections for a full year.' },
  { key: 'paymentMethodSummary', label: 'Payment methods', description: 'Collections grouped by payment method.' },
  { key: 'outstandingBalances', label: 'Outstanding balances', description: 'Total unpaid member bill balances.' },
  { key: 'outstandingByZone', label: 'Zone balances', description: 'Outstanding balance for a selected zone.' },
  { key: 'membersByZone', label: 'Members by zone', description: 'Member distribution across zones.' },
  { key: 'cashierSummary', label: 'Cashier summary', description: 'Cashier reporting period summary.' },
];
const emptyReportFilters = {
  fromDate: `${currentYear}-01-01`,
  toDate: todayIso,
  date: todayIso,
  year: String(currentYear),
  month: String(new Date().getMonth() + 1),
  zoneId: '',
};
const settingTabs = [
  { key: 'zones', label: 'Zones' },
  { key: 'sections', label: 'Sections' },
  { key: 'ministries', label: 'Ministries' },
  { key: 'massCentres', label: 'Mass Centres' },
  { key: 'guilds', label: 'Guilds' },
];
const resourceConfigs = {
  sections: {
    title: 'Sections',
    singular: 'section',
    directory: 'Section directory',
    description: 'Manage sections and assign each one to a zone.',
    path: '/api/sections',
    emptyForm: { name: '', zoneId: '' },
    fields: [
      { name: 'name', label: 'Section name', placeholder: 'Example: Section A', required: true },
      { name: 'zoneId', label: 'Zone', type: 'zone-select', required: true },
    ],
    columns: [
      { key: 'name', label: 'Section' },
      { key: 'zone', label: 'Zone' },
    ],
  },
  ministries: {
    title: 'Ministries',
    singular: 'ministry',
    directory: 'Ministry directory',
    description: 'Manage parish ministries and their descriptions.',
    path: '/api/ministries',
    emptyForm: { name: '', description: '' },
    fields: [
      { name: 'name', label: 'Ministry name', placeholder: 'Example: Choir', required: true },
      { name: 'description', label: 'Description', placeholder: 'Optional' },
    ],
    columns: [
      { key: 'name', label: 'Ministry' },
      { key: 'description', label: 'Description' },
    ],
  },
  massCentres: {
    title: 'Mass Centres',
    singular: 'mass centre',
    directory: 'Mass centre directory',
    description: 'Manage mass centres and their locations.',
    path: '/api/mass-centres',
    emptyForm: { name: '', location: '' },
    fields: [
      { name: 'name', label: 'Mass centre name', placeholder: 'Example: Main Church', required: true },
      { name: 'location', label: 'Location', placeholder: 'Optional' },
    ],
    columns: [
      { key: 'name', label: 'Mass centre' },
      { key: 'location', label: 'Location' },
    ],
  },
  guilds: {
    title: 'Guilds',
    singular: 'guild',
    directory: 'Guild directory',
    description: 'Manage parish guilds and their descriptions.',
    path: '/api/guilds',
    emptyForm: { name: '', description: '' },
    fields: [
      { name: 'name', label: 'Guild name', placeholder: 'Example: St. Anne Guild', required: true },
      { name: 'description', label: 'Description', placeholder: 'Optional' },
    ],
    columns: [
      { key: 'name', label: 'Guild' },
      { key: 'description', label: 'Description' },
    ],
  },
};
const initialResourceData = Object.fromEntries(Object.keys(resourceConfigs).map((key) => [key, []]));
const initialResourceForms = Object.fromEntries(
  Object.entries(resourceConfigs).map(([key, config]) => [key, config.emptyForm]),
);
const initialResourceMeta = Object.fromEntries(Object.keys(resourceConfigs).map((key) => [key, false]));
const initialResourceErrors = Object.fromEntries(Object.keys(resourceConfigs).map((key) => [key, '']));
const initialEditingIds = Object.fromEntries(Object.keys(resourceConfigs).map((key) => [key, null]));

function getInitialSection() {
  if (window.location.pathname === '/settings') return 'settings';
  if (window.location.pathname.startsWith('/members')) return 'members';
  if (window.location.pathname.startsWith('/billing')) return 'billing';
  if (window.location.pathname.startsWith('/payments')) return 'payments';
  if (window.location.pathname.startsWith('/reports')) return 'reports';
  return 'dashboard';
}

function getInitialMemberTab() {
  return window.location.pathname === '/members/add' ? 'add' : 'directory';
}

function getInitialBillingTab() {
  if (window.location.pathname === '/billing/run') return 'run';
  if (window.location.pathname === '/billing/bills') return 'bills';
  return 'items';
}

function getInitialPaymentTab() {
  return window.location.pathname === '/payments/history' ? 'history' : 'capture';
}

function getInitialReportKey() {
  const key = window.location.pathname.split('/')[2];
  return reportTabs.some((tab) => tab.key === key) ? key : 'dailyCollections';
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const url = new URL(path, BACKEND_BASE_URL);
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok || payload?.success === false) {
    const details =
      payload?.errors && typeof payload.errors === 'object'
        ? Object.values(payload.errors).flat().filter(Boolean).join(' ')
        : '';
    const message = details || payload?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.payload = payload;
    error.status = response.status;
    throw error;
  }

  return payload;
}

function formatMetricLabel(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMetricValue(value) {
  if (typeof value === 'number') return new Intl.NumberFormat().format(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function isMetricBreakdown(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function formatBreakdownValue(value) {
  return typeof value === 'number' ? new Intl.NumberFormat().format(value) : formatMetricValue(value);
}

function formatCurrency(value, currency = 'USD') {
  const amount = Number(value ?? 0);
  return `${currency} ${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
}

function pdfText(value) {
  return String(value ?? 'N/A')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[\\()]/g, '\\$&');
}

function pdfColor([red, green, blue], operator) {
  return `${red} ${green} ${blue} ${operator}`;
}

function pdfFillRect(x, y, width, height, color) {
  return `q ${pdfColor(color, 'rg')} ${x} ${y} ${width} ${height} re f Q`;
}

function pdfStrokeRect(x, y, width, height, color, lineWidth = 1) {
  return `q ${lineWidth} w ${pdfColor(color, 'RG')} ${x} ${y} ${width} ${height} re S Q`;
}

function pdfLine(x1, y1, x2, y2, color, lineWidth = 1) {
  return `q ${lineWidth} w ${pdfColor(color, 'RG')} ${x1} ${y1} m ${x2} ${y2} l S Q`;
}

function pdfDrawText(text, x, y, { size = 10, font = 'F1', color = [0.12, 0.16, 0.2] } = {}) {
  return `q ${pdfColor(color, 'rg')} BT /${font} ${size} Tf ${x} ${y} Td (${pdfText(text)}) Tj ET Q`;
}

function wrapPdfText(value, maxLength = 64) {
  const words = String(value || 'N/A').split(/\s+/);
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines.length > 0 ? lines : ['N/A'];
}

function buildPdfDocument(stream, { width = 612, height = 792 } = {}) {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function buildReceiptPdf(receipt) {
  const allocations = Array.isArray(receipt.allocations) ? receipt.allocations : [];
  const allocationRows = allocations.length > 0 ? allocations : [{ memberBillId: 'N/A', amountAllocated: 0 }];
  const statusColor = receipt.reversed ? [0.72, 0.18, 0.13] : [0.09, 0.36, 0.24];
  const content = [];
  const add = (command) => content.push(command);
  const detailCard = (label, value, x, y, width = 156) => {
    add(pdfFillRect(x, y, width, 54, [1, 1, 1]));
    add(pdfStrokeRect(x, y, width, 54, [0.86, 0.9, 0.9], 0.8));
    add(pdfDrawText(label, x + 12, y + 34, { size: 8, font: 'F2', color: [0.42, 0.49, 0.54] }));
    add(pdfDrawText(value, x + 12, y + 16, { size: 11, font: 'F2', color: [0.12, 0.16, 0.2] }));
  };

  add(pdfFillRect(0, 0, 612, 792, [0.97, 0.98, 0.98]));
  add(pdfFillRect(0, 704, 612, 88, [0.08, 0.34, 0.32]));
  add(pdfFillRect(0, 704, 612, 5, [0.82, 0.66, 0.28]));
  add(pdfDrawText('PARISH PAYMENT RECEIPT', 44, 752, { size: 19, font: 'F2', color: [1, 1, 1] }));
  add(pdfDrawText('Official member payment confirmation', 44, 730, { size: 10, color: [0.83, 0.93, 0.91] }));
  add(pdfDrawText(receipt.receiptNo, 392, 752, { size: 15, font: 'F2', color: [1, 1, 1] }));
  add(pdfDrawText(`Generated ${receipt.generatedAt}`, 392, 731, { size: 9, color: [0.83, 0.93, 0.91] }));

  add(pdfFillRect(44, 610, 524, 76, [1, 1, 1]));
  add(pdfStrokeRect(44, 610, 524, 76, [0.84, 0.89, 0.89], 0.8));
  add(pdfDrawText('Received from', 64, 660, { size: 8, font: 'F2', color: [0.42, 0.49, 0.54] }));
  add(pdfDrawText(receipt.member, 64, 638, { size: 18, font: 'F2', color: [0.1, 0.25, 0.25] }));
  add(pdfDrawText(`Payment date: ${receipt.paymentDate}`, 64, 621, { size: 10, color: [0.42, 0.49, 0.54] }));
  add(pdfDrawText('Amount paid', 408, 660, { size: 8, font: 'F2', color: [0.42, 0.49, 0.54] }));
  add(pdfDrawText(receipt.amount, 408, 636, { size: 20, font: 'F2', color: [0.08, 0.34, 0.32] }));

  add(pdfFillRect(44, 574, 92, 22, receipt.reversed ? [1, 0.9, 0.88] : [0.87, 0.96, 0.91]));
  add(pdfDrawText(receipt.reversed ? 'REVERSED' : 'VALID', 64, 581, { size: 9, font: 'F2', color: statusColor }));

  detailCard('Method', receipt.method, 44, 500);
  detailCard('Reference', receipt.reference, 184, 500);
  detailCard('Current balance', receipt.balance, 324, 500);
  detailCard('Received by', receipt.receivedBy, 464, 500, 104);

  add(pdfDrawText('Allocations', 44, 460, { size: 13, font: 'F2', color: [0.12, 0.16, 0.2] }));
  add(pdfFillRect(44, 434, 524, 24, [0.08, 0.34, 0.32]));
  add(pdfDrawText('Bill', 60, 442, { size: 9, font: 'F2', color: [1, 1, 1] }));
  add(pdfDrawText('Allocated amount', 420, 442, { size: 9, font: 'F2', color: [1, 1, 1] }));

  allocationRows.slice(0, 9).forEach((allocation, index) => {
    const y = 410 - index * 28;
    add(pdfFillRect(44, y, 524, 28, index % 2 === 0 ? [1, 1, 1] : [0.94, 0.97, 0.97]));
    add(pdfLine(44, y, 568, y, [0.86, 0.9, 0.9], 0.6));
    add(pdfDrawText(`Bill #${allocation.memberBillId}`, 60, y + 10, { size: 10, color: [0.22, 0.28, 0.33] }));
    add(pdfDrawText(formatCurrency(allocation.amountAllocated, receipt.currency), 420, y + 10, { size: 10, font: 'F2', color: [0.12, 0.16, 0.2] }));
  });

  const notesY = Math.max(118, 410 - allocationRows.slice(0, 9).length * 28 - 52);
  add(pdfDrawText('Notes', 44, notesY + 36, { size: 12, font: 'F2', color: [0.12, 0.16, 0.2] }));
  add(pdfFillRect(44, notesY - 12, 524, 38, [1, 1, 1]));
  add(pdfStrokeRect(44, notesY - 12, 524, 38, [0.86, 0.9, 0.9], 0.8));
  wrapPdfText(receipt.notes, 86).slice(0, 2).forEach((line, index) => {
    add(pdfDrawText(line, 58, notesY + 10 - index * 14, { size: 9, color: [0.36, 0.43, 0.48] }));
  });

  add(pdfLine(44, 70, 568, 70, [0.82, 0.87, 0.87], 0.8));
  add(pdfDrawText('Thank you. This receipt was generated electronically by the parish system.', 44, 50, {
    size: 9,
    color: [0.42, 0.49, 0.54],
  }));

  return buildPdfDocument(content.join('\n'));
}

function downloadPdf(filename, receipt) {
  const blob = new Blob([buildReceiptPdf(receipt)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function contributionTone(month) {
  const paid = Number(month?.paid ?? 0);
  const billed = Number(month?.billed ?? 0);
  const balance = Number(month?.balance ?? 0);
  if (paid <= 0) return 'none';
  return balance <= 0 || (billed > 0 && paid >= billed) ? 'full' : 'partial';
}

function buildContributionPdf({ member, summary, generatedAt }) {
  const pageWidth = 792;
  const pageHeight = 612;
  const monthsData = Array.isArray(summary.months) ? summary.months : [];
  const totalBilled = monthsData.reduce((sum, month) => sum + Number(month.billed ?? 0), 0);
  const totalPaid = monthsData.reduce((sum, month) => sum + Number(month.paid ?? 0), 0);
  const totalBalance = monthsData.reduce((sum, month) => sum + Number(month.balance ?? 0), 0);
  const currency = monthsData.find((month) => month.currency)?.currency || 'USD';
  const content = [];
  const add = (command) => content.push(command);
  const details = [
    ['Membership no', member.membershipNo || 'N/A'],
    ['Zone', member.zone || 'N/A'],
    ['Section', member.section || 'N/A'],
    ['Mass centre', member.massCentre || 'N/A'],
    ['Contact', member.cell || member.telephone || 'N/A'],
    ['Status', formatMetricLabel(member.status || 'UNKNOWN')],
  ];
  const summaryCard = (label, value, x, color = [0.08, 0.34, 0.32]) => {
    add(pdfFillRect(x, 390, 210, 58, [1, 1, 1]));
    add(pdfStrokeRect(x, 390, 210, 58, [0.86, 0.9, 0.9], 0.8));
    add(pdfDrawText(label, x + 13, 424, { size: 8, font: 'F2', color: [0.42, 0.49, 0.54] }));
    add(pdfDrawText(value, x + 13, 404, { size: 16, font: 'F2', color }));
  };

  add(pdfFillRect(0, 0, pageWidth, pageHeight, [0.97, 0.98, 0.98]));
  add(pdfFillRect(0, 524, pageWidth, 88, [0.08, 0.34, 0.32]));
  add(pdfFillRect(0, 524, pageWidth, 5, [0.82, 0.66, 0.28]));
  add(pdfDrawText('ANNUAL CONTRIBUTION STATEMENT', 44, 572, { size: 18, font: 'F2', color: [1, 1, 1] }));
  add(pdfDrawText(`Full year contribution summary for ${summary.year}`, 44, 550, { size: 10, color: [0.83, 0.93, 0.91] }));
  add(pdfDrawText(`Generated ${generatedAt}`, 594, 555, { size: 9, color: [0.83, 0.93, 0.91] }));

  add(pdfFillRect(44, 462, 704, 44, [1, 1, 1]));
  add(pdfStrokeRect(44, 462, 704, 44, [0.84, 0.89, 0.89], 0.8));
  add(pdfDrawText('Member', 64, 488, { size: 8, font: 'F2', color: [0.42, 0.49, 0.54] }));
  add(pdfDrawText(fullName(member), 64, 471, { size: 16, font: 'F2', color: [0.1, 0.25, 0.25] }));
  add(pdfDrawText(`Member ID: ${member.id || 'N/A'}`, 580, 488, { size: 8.5, color: [0.42, 0.49, 0.54] }));
  add(pdfDrawText(`Year: ${summary.year}`, 580, 471, { size: 11, font: 'F2', color: [0.12, 0.16, 0.2] }));

  summaryCard('Total billed', formatCurrency(totalBilled, currency), 44);
  summaryCard('Total paid', formatCurrency(totalPaid, currency), 291, [0.09, 0.36, 0.24]);
  summaryCard('Balance', formatCurrency(totalBalance, currency), 538, totalBalance > 0 ? [0.72, 0.32, 0.05] : [0.09, 0.36, 0.24]);

  add(pdfDrawText('Member details', 44, 360, { size: 12, font: 'F2', color: [0.12, 0.16, 0.2] }));
  details.forEach(([label, value], index) => {
    const x = 44 + (index % 6) * 118;
    const y = 318;
    add(pdfFillRect(x, y, 106, 30, [1, 1, 1]));
    add(pdfStrokeRect(x, y, 106, 30, [0.87, 0.9, 0.9], 0.6));
    add(pdfDrawText(label, x + 7, y + 18, { size: 6.5, font: 'F2', color: [0.42, 0.49, 0.54] }));
    add(pdfDrawText(value, x + 7, y + 7, { size: 7.5, color: [0.12, 0.16, 0.2] }));
  });

  add(pdfDrawText('Monthly contributions', 44, 280, { size: 12, font: 'F2', color: [0.12, 0.16, 0.2] }));
  add(pdfFillRect(44, 254, 704, 24, [0.08, 0.34, 0.32]));
  add(pdfDrawText('Month', 58, 262, { size: 8.5, font: 'F2', color: [1, 1, 1] }));
  add(pdfDrawText('Billed', 158, 262, { size: 8.5, font: 'F2', color: [1, 1, 1] }));
  add(pdfDrawText('Paid', 285, 262, { size: 8.5, font: 'F2', color: [1, 1, 1] }));
  add(pdfDrawText('Balance', 412, 262, { size: 8.5, font: 'F2', color: [1, 1, 1] }));
  add(pdfDrawText('Status / receipt', 560, 262, { size: 8.5, font: 'F2', color: [1, 1, 1] }));

  monthsData.slice(0, 12).forEach((month, index) => {
    const y = 230 - index * 18;
    const tone = contributionTone(month);
    const background = tone === 'full' ? [0.87, 0.96, 0.91] : tone === 'partial' ? [1, 0.95, 0.84] : [1, 1, 1];
    const accent = tone === 'full' ? [0.09, 0.36, 0.24] : tone === 'partial' ? [0.72, 0.32, 0.05] : [0.42, 0.49, 0.54];
    add(pdfFillRect(44, y, 704, 18, background));
    add(pdfLine(44, y, 748, y, [0.86, 0.9, 0.9], 0.45));
    add(pdfDrawText(month.month, 58, y + 6, { size: 8, font: 'F2', color: accent }));
    add(pdfDrawText(formatCurrency(month.billed, currency), 158, y + 6, { size: 8 }));
    add(pdfDrawText(formatCurrency(month.paid, currency), 285, y + 6, { size: 8, font: 'F2', color: accent }));
    add(pdfDrawText(formatCurrency(month.balance, currency), 412, y + 6, { size: 8 }));
    add(pdfDrawText(`${formatMetricLabel(month.status || 'N/A')} ${month.receiptNo || ''}`.trim(), 560, y + 6, {
      size: 7.5,
      color: [0.22, 0.28, 0.33],
    }));
  });

  add(pdfLine(44, 30, 748, 30, [0.82, 0.87, 0.87], 0.8));
  add(pdfDrawText('This annual contribution statement was generated electronically by the parish system.', 44, 14, {
    size: 8.5,
    color: [0.42, 0.49, 0.54],
  }));

  return buildPdfDocument(content.join('\n'), { width: pageWidth, height: pageHeight });
}

function downloadContributionPdf(filename, data) {
  const blob = new Blob([buildContributionPdf(data)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function reportLabel(key) {
  return formatMetricLabel(key);
}

function formatReportValue(value) {
  if (typeof value === 'number') return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'object') return JSON.stringify(value);
  return formatMetricLabel(value);
}

function getReportRows(data) {
  return Array.isArray(data) ? data : [];
}

function getReportEntries(data) {
  if (!data || Array.isArray(data) || typeof data !== 'object') return [];
  return Object.entries(data).filter(([key]) => key !== 'export');
}

function getReportColumns(rows) {
  return Array.from(rows.reduce((keys, row) => {
    Object.keys(row ?? {}).forEach((key) => keys.add(key));
    return keys;
  }, new Set()));
}

function buildReportPdf({ title, subtitle, data, generatedAt }) {
  const pageWidth = 792;
  const pageHeight = 612;
  const rows = getReportRows(data);
  const entries = getReportEntries(data);
  const columns = getReportColumns(rows).slice(0, 6);
  const content = [];
  const add = (command) => content.push(command);

  add(pdfFillRect(0, 0, pageWidth, pageHeight, [0.97, 0.98, 0.98]));
  add(pdfFillRect(0, 524, pageWidth, 88, [0.08, 0.34, 0.32]));
  add(pdfFillRect(0, 524, pageWidth, 5, [0.82, 0.66, 0.28]));
  add(pdfDrawText(title, 44, 572, { size: 18, font: 'F2', color: [1, 1, 1] }));
  add(pdfDrawText(subtitle, 44, 550, { size: 10, color: [0.83, 0.93, 0.91] }));
  add(pdfDrawText(`Generated ${generatedAt}`, 590, 554, { size: 9, color: [0.83, 0.93, 0.91] }));

  if (entries.length > 0) {
    add(pdfDrawText('Summary', 44, 490, { size: 13, font: 'F2', color: [0.12, 0.16, 0.2] }));
    entries.slice(0, 9).forEach(([key, value], index) => {
      const x = 44 + (index % 3) * 236;
      const y = 410 - Math.floor(index / 3) * 64;
      add(pdfFillRect(x, y, 216, 50, [1, 1, 1]));
      add(pdfStrokeRect(x, y, 216, 50, [0.86, 0.9, 0.9], 0.8));
      add(pdfDrawText(reportLabel(key), x + 12, y + 30, { size: 8, font: 'F2', color: [0.42, 0.49, 0.54] }));
      add(pdfDrawText(formatReportValue(value), x + 12, y + 13, { size: 13, font: 'F2', color: [0.08, 0.34, 0.32] }));
    });
  }

  if (rows.length > 0) {
    add(pdfDrawText('Breakdown', 44, 490, { size: 13, font: 'F2', color: [0.12, 0.16, 0.2] }));
    add(pdfFillRect(44, 462, 704, 24, [0.08, 0.34, 0.32]));
    columns.forEach((column, index) => {
      add(pdfDrawText(reportLabel(column), 58 + index * 112, 470, { size: 8, font: 'F2', color: [1, 1, 1] }));
    });
    rows.slice(0, 16).forEach((row, rowIndex) => {
      const y = 438 - rowIndex * 22;
      add(pdfFillRect(44, y, 704, 22, rowIndex % 2 === 0 ? [1, 1, 1] : [0.94, 0.97, 0.97]));
      add(pdfLine(44, y, 748, y, [0.86, 0.9, 0.9], 0.45));
      columns.forEach((column, index) => {
        const value = formatReportValue(row?.[column]);
        add(pdfDrawText(value, 58 + index * 112, y + 8, { size: 7.5, color: [0.22, 0.28, 0.33] }));
      });
    });
  }

  if (entries.length === 0 && rows.length === 0) {
    add(pdfFillRect(44, 390, 704, 74, [1, 1, 1]));
    add(pdfStrokeRect(44, 390, 704, 74, [0.86, 0.9, 0.9], 0.8));
    add(pdfDrawText('No report data returned for the selected filters.', 64, 426, { size: 12, font: 'F2' }));
  }

  add(pdfLine(44, 42, 748, 42, [0.82, 0.87, 0.87], 0.8));
  add(pdfDrawText('Report generated electronically by the parish system.', 44, 24, {
    size: 8.5,
    color: [0.42, 0.49, 0.54],
  }));

  return buildPdfDocument(content.join('\n'), { width: pageWidth, height: pageHeight });
}

function downloadReportPdf(filename, data) {
  const blob = new Blob([buildReportPdf(data)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function fullName(member) {
  return [member?.firstNames, member?.surname].filter(Boolean).join(' ') || 'Unnamed member';
}

function toOptionalNumber(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function toOptionalString(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
}

function App() {
  const [session, setSession] = useState(readSession);
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zonesError, setZonesError] = useState('');
  const [zoneForm, setZoneForm] = useState(emptyZoneForm);
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [activeSettingTab, setActiveSettingTab] = useState('zones');
  const [resourceData, setResourceData] = useState(initialResourceData);
  const [resourceForms, setResourceForms] = useState(initialResourceForms);
  const [resourceLoading, setResourceLoading] = useState(initialResourceMeta);
  const [resourceErrors, setResourceErrors] = useState(initialResourceErrors);
  const [editingResourceIds, setEditingResourceIds] = useState(initialEditingIds);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState('');
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [activeMemberTab, setActiveMemberTab] = useState(getInitialMemberTab);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberFilters, setMemberFilters] = useState({ keyword: '', zoneId: '' });
  const [memberStatement, setMemberStatement] = useState(null);
  const [statementFilters, setStatementFilters] = useState({ fromDate: '', toDate: '' });
  const [contributionYear, setContributionYear] = useState(String(new Date().getFullYear()));
  const [contributionSummary, setContributionSummary] = useState(null);
  const [associationForm, setAssociationForm] = useState({ ministryId: '', guildId: '' });
  const [activeBillingTab, setActiveBillingTab] = useState(getInitialBillingTab);
  const [billingItems, setBillingItems] = useState([]);
  const [billingItemsLoading, setBillingItemsLoading] = useState(false);
  const [billingItemsError, setBillingItemsError] = useState('');
  const [billingItemForm, setBillingItemForm] = useState(emptyBillingItemForm);
  const [editingBillingItemId, setEditingBillingItemId] = useState(null);
  const [memberBills, setMemberBills] = useState([]);
  const [memberBillsLoading, setMemberBillsLoading] = useState(false);
  const [memberBillsError, setMemberBillsError] = useState('');
  const [billFilters, setBillFilters] = useState({
    mode: 'all',
    year: String(currentYear),
    month: currentMonth,
    memberId: '',
  });
  const [billingRunForm, setBillingRunForm] = useState(emptyBillingRunForm);
  const [billingRunResults, setBillingRunResults] = useState([]);
  const [activePaymentTab, setActivePaymentTab] = useState(getInitialPaymentTab);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState('');
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [paymentLookup, setPaymentLookup] = useState({ mode: 'all', memberId: '', receiptNo: '' });
  const [paymentBills, setPaymentBills] = useState([]);
  const [paymentBillsLoading, setPaymentBillsLoading] = useState(false);
  const [paymentAllocations, setPaymentAllocations] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [activeReportKey, setActiveReportKey] = useState(getInitialReportKey);
  const [reportFilters, setReportFilters] = useState(emptyReportFilters);
  const [reportResult, setReportResult] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [busyAction, setBusyAction] = useState('');
  const [toast, setToast] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', confirmPassword: '' });

  const sections = resourceData.sections ?? [];
  const ministries = resourceData.ministries ?? [];
  const massCentres = resourceData.massCentres ?? [];
  const guilds = resourceData.guilds ?? [];

  useEffect(() => {
    saveSession(session);
  }, [session]);

  useEffect(() => {
    const nextPath = session.accessToken
      ? activeSection === 'members'
        ? `/members/${activeMemberTab}`
        : activeSection === 'billing'
          ? `/billing/${activeBillingTab}`
          : activeSection === 'payments'
            ? `/payments/${activePaymentTab}`
            : activeSection === 'reports'
              ? `/reports/${activeReportKey}`
              : `/${activeSection}`
      : '/';
    if (window.location.pathname !== nextPath) {
      window.history.replaceState(null, '', nextPath);
    }
  }, [session.accessToken, activeSection, activeMemberTab, activeBillingTab, activePaymentTab, activeReportKey]);

  useEffect(() => {
    if (session.accessToken && !dashboard && !dashboardLoading) {
      loadDashboard(session.accessToken);
    }
  }, [session.accessToken]);

  useEffect(() => {
    if (
      session.accessToken &&
      ['settings', 'members', 'billing', 'payments', 'reports'].includes(activeSection) &&
      zones.length === 0 &&
      !zonesLoading
    ) {
      loadZones(session.accessToken);
    }
  }, [session.accessToken, activeSection]);

  useEffect(() => {
    if (!session.accessToken || activeSection !== 'settings' || activeSettingTab === 'zones') return;

    const currentRows = resourceData[activeSettingTab] ?? [];
    if (currentRows.length === 0 && !resourceLoading[activeSettingTab]) {
      loadResource(activeSettingTab, session.accessToken);
    }

    if (activeSettingTab === 'sections' && zones.length === 0 && !zonesLoading) {
      loadZones(session.accessToken);
    }
  }, [session.accessToken, activeSection, activeSettingTab]);

  useEffect(() => {
    if (!session.accessToken || activeSection !== 'members') return;

    if (members.length === 0 && !membersLoading) loadMembers(session.accessToken);
    Object.keys(resourceConfigs).forEach((key) => {
      if ((resourceData[key] ?? []).length === 0 && !resourceLoading[key]) {
        loadResource(key, session.accessToken);
      }
    });
  }, [session.accessToken, activeSection]);

  useEffect(() => {
    if (!session.accessToken || activeSection !== 'billing') return;

    if (billingItems.length === 0 && !billingItemsLoading) loadBillingItems(session.accessToken);
    if (memberBills.length === 0 && !memberBillsLoading) loadMemberBills(session.accessToken, billFilters);
    if (members.length === 0 && !membersLoading) loadMembers(session.accessToken);
    if ((resourceData.guilds ?? []).length === 0 && !resourceLoading.guilds) {
      loadResource('guilds', session.accessToken);
    }
  }, [session.accessToken, activeSection]);

  useEffect(() => {
    if (!session.accessToken || activeSection !== 'payments') return;

    if (members.length === 0 && !membersLoading) loadMembers(session.accessToken);
    if (payments.length === 0 && !paymentsLoading) loadPayments(session.accessToken, paymentLookup);
  }, [session.accessToken, activeSection]);

  useEffect(() => {
    if (!session.accessToken || activeSection !== 'reports') return;
    if (zones.length === 0 && !zonesLoading) loadZones(session.accessToken);
    if (!reportResult && activeReportKey === 'dailyCollections' && !reportsLoading) {
      loadReport('dailyCollections', session.accessToken);
    }
  }, [session.accessToken, activeSection, activeReportKey, reportResult, reportsLoading]);

  const filteredSections = useMemo(() => {
    if (!memberForm.zoneId) return sections;
    return sections.filter((section) => Number(section.zoneId) === Number(memberForm.zoneId));
  }, [memberForm.zoneId, sections]);

  const paymentAllocationTotal = useMemo(
    () => Object.values(paymentAllocations).reduce((sum, value) => sum + Number(value || 0), 0),
    [paymentAllocations],
  );

  const runAction = async (name, action) => {
    setBusyAction(name);
    setToast(null);
    try {
      const payload = await action();
      if (payload) setToast({ type: 'success', message: payload.message || 'Request completed successfully.' });
      return payload;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        endSession('Your session has expired or access was denied. Please sign in again.');
        return null;
      }

      setToast({ type: 'error', message: error.message });
      return null;
    } finally {
      setBusyAction('');
    }
  };

  const endSession = (message) => {
    setSession({});
    setDashboard(null);
    setDashboardError('');
    setZones([]);
    setResourceData(initialResourceData);
    setResourceForms(initialResourceForms);
    setMembers([]);
    setSelectedMember(null);
    setMemberStatement(null);
    setContributionSummary(null);
    setBillingItems([]);
    setMemberBills([]);
    setBillingRunResults([]);
    setBillingItemForm(emptyBillingItemForm);
    setBillingRunForm(emptyBillingRunForm);
    setPayments([]);
    setPaymentForm(emptyPaymentForm);
    setPaymentBills([]);
    setPaymentAllocations({});
    setSelectedPayment(null);
    setReportResult(null);
    setReportFilters(emptyReportFilters);
    setReportsError('');
    setEditingZoneId(null);
    setEditingResourceIds(initialEditingIds);
    setEditingMemberId(null);
    setEditingBillingItemId(null);
    clearSession();
    setToast(message ? { type: 'error', message } : null);
  };

  const loadDashboard = async (token = session.accessToken) => {
    if (!token) return null;

    setDashboardLoading(true);
    setDashboardError('');
    try {
      const payload = await apiRequest('/api/dashboard/summary', { token });
      setDashboard(payload.data ?? {});
      return payload;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        endSession('Your session has expired or access was denied. Please sign in again.');
        return null;
      }

      setDashboardError(error.message);
      return null;
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadZones = async (token = session.accessToken) => {
    if (!token) return null;

    setZonesLoading(true);
    setZonesError('');
    try {
      const payload = await apiRequest('/api/zones', { token });
      setZones(Array.isArray(payload.data) ? payload.data : []);
      return payload;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        endSession('Your session has expired or access was denied. Please sign in again.');
        return null;
      }

      setZonesError(error.message);
      return null;
    } finally {
      setZonesLoading(false);
    }
  };

  const loadResource = async (resourceKey, token = session.accessToken) => {
    const config = resourceConfigs[resourceKey];
    if (!config || !token) return null;

    setResourceLoading((current) => ({ ...current, [resourceKey]: true }));
    setResourceErrors((current) => ({ ...current, [resourceKey]: '' }));
    try {
      const payload = await apiRequest(config.path, { token });
      setResourceData((current) => ({
        ...current,
        [resourceKey]: Array.isArray(payload.data) ? payload.data : [],
      }));
      return payload;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        endSession('Your session has expired or access was denied. Please sign in again.');
        return null;
      }

      setResourceErrors((current) => ({ ...current, [resourceKey]: error.message }));
      return null;
    } finally {
      setResourceLoading((current) => ({ ...current, [resourceKey]: false }));
    }
  };

  const loadMembers = async (token = session.accessToken, filters = memberFilters) => {
    if (!token) return null;

    setMembersLoading(true);
    setMembersError('');
    try {
      let path = '/api/members';
      const keyword = filters.keyword.trim();
      if (keyword) path = `/api/members/search?keyword=${encodeURIComponent(keyword)}`;
      if (!keyword && filters.zoneId) path = `/api/members/by-zone/${filters.zoneId}`;

      const payload = await apiRequest(path, { token });
      const rows = Array.isArray(payload.data) ? payload.data : [];
      setMembers(rows);
      if (selectedMember && !rows.some((member) => member.id === selectedMember.id)) setSelectedMember(null);
      return payload;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        endSession('Your session has expired or access was denied. Please sign in again.');
        return null;
      }

      setMembersError(error.message);
      return null;
    } finally {
      setMembersLoading(false);
    }
  };

  const refreshSelectedMember = async (memberId = selectedMember?.id, token = session.accessToken) => {
    if (!memberId || !token) return null;

    const payload = await apiRequest(`/api/members/${memberId}`, { token });
    const member = payload.data ?? null;
    setSelectedMember(member);
    setMembers((current) => current.map((item) => (item.id === member?.id ? member : item)));
    return payload;
  };

  const loadBillingItems = async (token = session.accessToken) => {
    if (!token) return null;

    setBillingItemsLoading(true);
    setBillingItemsError('');
    try {
      const payload = await apiRequest('/api/billing-items', { token });
      setBillingItems(Array.isArray(payload.data) ? payload.data : []);
      return payload;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        endSession('Your session has expired or access was denied. Please sign in again.');
        return null;
      }

      setBillingItemsError(error.message);
      return null;
    } finally {
      setBillingItemsLoading(false);
    }
  };

  const buildMemberBillsPath = (filters = billFilters) => {
    if (filters.mode === 'outstanding') return '/api/member-bills/outstanding';
    if (filters.mode === 'period') return `/api/member-bills/year/${filters.year}/month/${filters.month}`;
    if (filters.mode === 'member') return `/api/member-bills/member/${filters.memberId}`;
    return '/api/member-bills';
  };

  const loadMemberBills = async (token = session.accessToken, filters = billFilters) => {
    if (!token) return null;

    if (filters.mode === 'period' && (!filters.year || !filters.month)) {
      setMemberBillsError('Select a year and month before loading bills by period.');
      return null;
    }

    if (filters.mode === 'member' && !filters.memberId) {
      setMemberBillsError('Select a member before loading member bills.');
      return null;
    }

    setMemberBillsLoading(true);
    setMemberBillsError('');
    try {
      const payload = await apiRequest(buildMemberBillsPath(filters), { token });
      setMemberBills(Array.isArray(payload.data) ? payload.data : []);
      return payload;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        endSession('Your session has expired or access was denied. Please sign in again.');
        return null;
      }

      setMemberBillsError(error.message);
      return null;
    } finally {
      setMemberBillsLoading(false);
    }
  };

  const resetBillingItemForm = () => {
    setEditingBillingItemId(null);
    setBillingItemForm(emptyBillingItemForm);
  };

  const buildBillingItemBody = () => {
    const amount = Number(billingItemForm.amount);
    const year = Number(billingItemForm.year);

    if (!billingItemForm.name.trim()) throw new Error('Billing item name is required.');
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter a billing amount greater than 0.');
    if (billingItemForm.year && (!Number.isInteger(year) || year < 2000)) throw new Error('Enter a valid billing year.');

    return {
      name: billingItemForm.name.trim(),
      description: toOptionalString(billingItemForm.description),
      amount,
      currency: billingItemForm.currency.trim() || 'USD',
      frequency: billingItemForm.frequency,
      appliesTo: billingItemForm.appliesTo,
      year: billingItemForm.year ? year : null,
      month: billingItemForm.month || null,
      status: billingItemForm.status,
    };
  };

  const handleBillingItemSubmit = (event) => {
    event.preventDefault();
    runAction('billing-item-save', async () => {
      const body = buildBillingItemBody();
      const path = editingBillingItemId ? `/api/billing-items/${editingBillingItemId}` : '/api/billing-items';
      const method = editingBillingItemId ? 'PUT' : 'POST';
      const payload = await apiRequest(path, { method, body, token: session.accessToken });
      await loadBillingItems();
      resetBillingItemForm();
      return {
        ...payload,
        message: editingBillingItemId ? 'Billing item updated successfully.' : 'Billing item created successfully.',
      };
    });
  };

  const handleEditBillingItem = (itemId) => {
    runAction('billing-item-edit', async () => {
      const payload = await apiRequest(`/api/billing-items/${itemId}`, { token: session.accessToken });
      const item = payload.data ?? {};
      setEditingBillingItemId(item.id);
      setBillingItemForm({
        name: item.name ?? '',
        description: item.description ?? '',
        amount: item.amount ?? '',
        currency: item.currency ?? 'USD',
        frequency: item.frequency ?? 'MONTHLY',
        appliesTo: item.appliesTo ?? 'ALL_MEMBERS',
        year: item.year ?? String(currentYear),
        month: item.month ?? currentMonth,
        status: item.status ?? 'ACTIVE',
      });
      setActiveBillingTab('items');
      return { ...payload, message: 'Billing item loaded for editing.' };
    });
  };

  const handleDeleteBillingItem = (itemId) => {
    runAction('billing-item-delete', async () => {
      const payload = await apiRequest(`/api/billing-items/${itemId}`, {
        method: 'DELETE',
        token: session.accessToken,
      });
      await loadBillingItems();
      if (editingBillingItemId === itemId) resetBillingItemForm();
      return { ...payload, message: 'Billing item deleted successfully.' };
    });
  };

  const handleRunBilling = (event) => {
    event.preventDefault();
    runAction('billing-run', async () => {
      const year = Number(billingRunForm.year);
      if (!billingRunForm.billingItemId) throw new Error('Select a billing item before running billing.');
      if (!billingRunForm.month) throw new Error('Select a billing month.');
      if (billingRunForm.year && (!Number.isInteger(year) || year < 2000)) throw new Error('Enter a valid billing year.');

      const body = {
        billingItemId: Number(billingRunForm.billingItemId),
        year: billingRunForm.year ? year : null,
        month: billingRunForm.month,
        zoneId: toOptionalNumber(billingRunForm.zoneId),
        guildId: toOptionalNumber(billingRunForm.guildId),
        memberId: toOptionalNumber(billingRunForm.memberId),
      };
      const payload = await apiRequest('/api/billing/run', { method: 'POST', body, token: session.accessToken });
      const generatedBills = Array.isArray(payload.data) ? payload.data : [];
      setBillingRunResults(generatedBills);
      setMemberBills(generatedBills);
      const allBillsFilter = { mode: 'all', year: String(currentYear), month: currentMonth, memberId: '' };
      setBillFilters(allBillsFilter);
      await loadMemberBills(session.accessToken, allBillsFilter);
      return { ...payload, message: `Billing run completed for ${generatedBills.length} bill(s).` };
    });
  };

  const handleLoadBills = (event) => {
    event.preventDefault();
    loadMemberBills(session.accessToken, billFilters);
  };

  const buildPaymentsPath = (lookup = paymentLookup) => {
    if (lookup.mode === 'member') return `/api/payments/member/${lookup.memberId}`;
    if (lookup.mode === 'receipt') return `/api/payments/receipt/${encodeURIComponent(lookup.receiptNo.trim())}`;
    return '/api/payments';
  };

  const loadPayments = async (token = session.accessToken, lookup = paymentLookup) => {
    if (!token) return null;

    if (lookup.mode === 'member' && !lookup.memberId) {
      setPaymentsError('Select a member before loading member payments.');
      return null;
    }

    if (lookup.mode === 'receipt' && !lookup.receiptNo.trim()) {
      setPaymentsError('Enter a receipt number before searching.');
      return null;
    }

    setPaymentsLoading(true);
    setPaymentsError('');
    try {
      const payload = await apiRequest(buildPaymentsPath(lookup), { token });
      const rows = lookup.mode === 'receipt' ? (payload.data ? [payload.data] : []) : Array.isArray(payload.data) ? payload.data : [];
      setPayments(rows);
      if (lookup.mode === 'receipt') setSelectedPayment(payload.data ?? null);
      return payload;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        endSession('Your session has expired or access was denied. Please sign in again.');
        return null;
      }

      setPaymentsError(error.message);
      return null;
    } finally {
      setPaymentsLoading(false);
    }
  };

  const loadPaymentBillsForMember = async (memberId, token = session.accessToken) => {
    if (!memberId || !token) {
      setPaymentBills([]);
      setPaymentAllocations({});
      return null;
    }

    setPaymentBillsLoading(true);
    setPaymentsError('');
    try {
      const payload = await apiRequest(`/api/member-bills/member/${memberId}`, { token });
      const unpaidBills = (Array.isArray(payload.data) ? payload.data : []).filter(
        (bill) => Number(bill.balance ?? 0) > 0 && !['PAID', 'CANCELLED'].includes(bill.status),
      );
      setPaymentBills(unpaidBills);
      setPaymentAllocations({});
      return payload;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        endSession('Your session has expired or access was denied. Please sign in again.');
        return null;
      }

      setPaymentsError(error.message);
      return null;
    } finally {
      setPaymentBillsLoading(false);
    }
  };

  const buildReportRequest = (reportKey = activeReportKey, filters = reportFilters) => {
    const tab = reportTabs.find((item) => item.key === reportKey) ?? reportTabs[0];
    const requireYear = () => {
      const year = Number(filters.year);
      if (!Number.isInteger(year) || year < 2000) throw new Error('Enter a valid report year.');
      return year;
    };
    const requireDate = (value, label) => {
      if (!value) throw new Error(`Select ${label}.`);
      return value;
    };
    const requireDateRange = () => {
      const fromDate = requireDate(filters.fromDate, 'from date');
      const toDate = requireDate(filters.toDate, 'to date');
      if (fromDate > toDate) throw new Error('From date cannot be after to date.');
      return { fromDate, toDate };
    };

    if (reportKey === 'dailyCollections') {
      const date = requireDate(filters.date, 'a report date');
      return { path: `/api/reports/collections/daily?date=${date}`, title: tab.label, subtitle: `Collections for ${date}` };
    }
    if (reportKey === 'monthlyCollections') {
      const year = requireYear();
      const month = Number(filters.month);
      if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error('Select a valid month.');
      return { path: `/api/reports/collections/monthly?year=${year}&month=${month}`, title: tab.label, subtitle: `Collections for ${year}-${String(month).padStart(2, '0')}` };
    }
    if (reportKey === 'yearlyCollections') {
      const year = requireYear();
      return { path: `/api/reports/collections/yearly?year=${year}`, title: tab.label, subtitle: `Collections for ${year}` };
    }
    if (reportKey === 'paymentMethodSummary') {
      const { fromDate, toDate } = requireDateRange();
      return { path: `/api/reports/payment-method-summary?fromDate=${fromDate}&toDate=${toDate}`, title: tab.label, subtitle: `Collections by method from ${fromDate} to ${toDate}` };
    }
    if (reportKey === 'outstandingBalances') {
      return { path: '/api/reports/outstanding-balances', title: tab.label, subtitle: 'All outstanding member bill balances' };
    }
    if (reportKey === 'outstandingByZone') {
      if (!filters.zoneId) throw new Error('Select a zone.');
      const zone = zones.find((item) => Number(item.id) === Number(filters.zoneId));
      return { path: `/api/reports/outstanding-balances/zone/${filters.zoneId}`, title: tab.label, subtitle: `Outstanding balances for ${zone?.name || `zone ${filters.zoneId}`}` };
    }
    if (reportKey === 'membersByZone') {
      return { path: '/api/reports/members/by-zone', title: tab.label, subtitle: 'Member count distribution by zone' };
    }
    if (reportKey === 'cashierSummary') {
      const { fromDate, toDate } = requireDateRange();
      return { path: `/api/reports/cashier-summary?fromDate=${fromDate}&toDate=${toDate}`, title: tab.label, subtitle: `Cashier summary from ${fromDate} to ${toDate}` };
    }

    return { path: '/api/reports/members/by-zone', title: tab.label, subtitle: tab.description };
  };

  const loadReport = async (reportKey = activeReportKey, token = session.accessToken) => {
    if (!token) return null;
    setReportsLoading(true);
    setReportsError('');
    try {
      const request = buildReportRequest(reportKey, reportFilters);
      const payload = await apiRequest(request.path, { token });
      const result = {
        ...request,
        key: reportKey,
        data: payload.data ?? null,
        message: payload.message,
        generatedAt: new Date().toLocaleString(),
      };
      setReportResult(result);
      return { ...payload, reportResult: result, message: payload.message || 'Report loaded.' };
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        endSession('Your session has expired or access was denied. Please sign in again.');
        return null;
      }
      setReportsError(error.message);
      return null;
    } finally {
      setReportsLoading(false);
    }
  };

  const handleRunReport = (event) => {
    event.preventDefault();
    runAction('report-run', async () => {
      const payload = await loadReport(activeReportKey);
      if (!payload?.reportResult) throw new Error('Report could not be loaded.');
      window.setTimeout(() => {
        document.querySelector('.report-preview-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return { ...payload, message: 'Report preview loaded.' };
    });
  };

  const handleDownloadReportPdf = () => {
    runAction('report-pdf', async () => {
      const loaded = reportResult?.key === activeReportKey ? null : await loadReport(activeReportKey);
      const nextResult = reportResult?.key === activeReportKey ? reportResult : loaded?.reportResult;
      if (!nextResult) throw new Error('Run the report before downloading the PDF.');
      downloadReportPdf(`${nextResult.key}-${new Date().toISOString().slice(0, 10)}.pdf`, {
        title: nextResult.title,
        subtitle: nextResult.subtitle,
        data: nextResult.data,
        generatedAt: new Date().toLocaleString(),
      });
      return { success: true, message: 'Report PDF downloaded.' };
    });
  };

  const handlePaymentMemberChange = (memberId) => {
    setPaymentForm((current) => ({ ...current, memberId }));
    setSelectedPayment(null);
    loadPaymentBillsForMember(memberId);
  };

  const preparePaymentForMember = (memberId) => {
    if (!memberId) return null;
    setPaymentForm((current) => ({
      ...current,
      memberId: String(memberId),
      paymentReference: '',
      notes: '',
    }));
    setPaymentAllocations({});
    setSelectedPayment(null);
    return loadPaymentBillsForMember(memberId);
  };

  const setAllocationAmount = (billId, amount) => {
    setPaymentAllocations((current) => ({ ...current, [billId]: amount }));
  };

  const buildPaymentBody = () => {
    if (!paymentForm.memberId) throw new Error('Select a member before capturing a payment.');
    if (!paymentForm.paymentDate) throw new Error('Select a payment date.');

    const allocations = paymentBills
      .map((bill) => ({
        bill,
        amount: Number(paymentAllocations[bill.id] || 0),
      }))
      .filter((entry) => entry.amount > 0);

    if (allocations.length === 0) throw new Error('Allocate the payment to at least one outstanding bill.');

    allocations.forEach(({ bill, amount }) => {
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('Allocation amounts must be greater than 0.');
      if (amount > Number(bill.balance ?? 0)) throw new Error(`Allocation for ${bill.billingItem} exceeds its balance.`);
    });

    const amount = allocations.reduce((sum, entry) => sum + entry.amount, 0);
    if (amount <= 0) throw new Error('Payment amount must be greater than 0.');

    return {
      memberId: Number(paymentForm.memberId),
      amount,
      currency: paymentForm.currency.trim() || 'USD',
      paymentMethod: paymentForm.paymentMethod,
      paymentReference: toOptionalString(paymentForm.paymentReference),
      paymentDate: paymentForm.paymentDate,
      notes: toOptionalString(paymentForm.notes),
      allocations: allocations.map(({ bill, amount: amountAllocated }) => ({
        memberBillId: bill.id,
        amountAllocated,
      })),
    };
  };

  const resetPaymentForm = () => {
    setPaymentForm(emptyPaymentForm);
    setPaymentBills([]);
    setPaymentAllocations({});
  };

  const handlePaymentSubmit = (event) => {
    event.preventDefault();
    runAction('payment-save', async () => {
      const payload = await apiRequest('/api/payments', {
        method: 'POST',
        body: buildPaymentBody(),
        token: session.accessToken,
      });
      const memberId = paymentForm.memberId;
      resetPaymentForm();
      if (activeSection === 'members' && memberId) {
        setPaymentForm({ ...emptyPaymentForm, memberId: String(memberId) });
      }
      await loadPayments(session.accessToken, paymentLookup);
      await loadMemberBills(session.accessToken, billFilters);
      if (memberId) await loadPaymentBillsForMember(memberId);
      if (activeSection === 'members' && memberStatement && selectedMember?.id === Number(memberId)) {
        const params = new URLSearchParams();
        if (statementFilters.fromDate) params.set('fromDate', statementFilters.fromDate);
        if (statementFilters.toDate) params.set('toDate', statementFilters.toDate);
        const query = params.toString() ? `?${params.toString()}` : '';
        const statementPayload = await apiRequest(`/api/members/${memberId}/statement${query}`, {
          token: session.accessToken,
        });
        setMemberStatement(statementPayload.data ?? null);
      }
      setSelectedPayment(payload.data ?? null);
      return { ...payload, message: `Payment captured successfully. Receipt ${payload.data?.receiptNo ?? ''}`.trim() };
    });
  };

  const handleLoadPayments = (event) => {
    event.preventDefault();
    loadPayments(session.accessToken, paymentLookup);
  };

  const handleOpenPayment = (paymentId) => {
    runAction('payment-open', async () => {
      const payload = await apiRequest(`/api/payments/${paymentId}`, { token: session.accessToken });
      setSelectedPayment(payload.data ?? null);
      return { ...payload, message: 'Payment loaded.' };
    });
  };

  const handleReversePayment = (paymentId) => {
    runAction('payment-reverse', async () => {
      const payload = await apiRequest(`/api/payments/${paymentId}/reverse`, {
        method: 'POST',
        token: session.accessToken,
      });
      setSelectedPayment(payload.data ?? null);
      await loadPayments(session.accessToken, paymentLookup);
      await loadMemberBills(session.accessToken, billFilters);
      if (paymentForm.memberId) await loadPaymentBillsForMember(paymentForm.memberId);
      return { ...payload, message: 'Payment reversed successfully.' };
    });
  };

  const handleDownloadPaymentReceipt = (payment, balance = null) => {
    if (!payment) return;
    const receiptNo = payment.receiptNo || `PAYMENT-${payment.id}`;
    const allocations = payment.allocations ?? [];
    downloadPdf(`${receiptNo}.pdf`, {
      receiptNo,
      member: payment.memberName || payment.memberId,
      paymentDate: payment.paymentDate || 'N/A',
      method: formatMetricLabel(payment.paymentMethod || 'N/A'),
      reference: payment.paymentReference || 'N/A',
      amount: formatCurrency(payment.amount, payment.currency),
      currency: payment.currency || 'USD',
      balance: balance !== null ? formatCurrency(balance, payment.currency) : 'N/A',
      receivedBy: payment.receivedByUserId || 'N/A',
      notes: payment.notes || 'No notes captured',
      reversed: payment.reversed,
      allocations,
      generatedAt: new Date().toLocaleString(),
    });
    setToast({ type: 'success', message: `Receipt ${receiptNo} downloaded.` });
  };

  const resetZoneForm = () => {
    setEditingZoneId(null);
    setZoneForm(emptyZoneForm);
  };

  const handleZoneSubmit = (event) => {
    event.preventDefault();
    runAction('zone-save', async () => {
      const body = {
        name: zoneForm.name.trim(),
        leaderName: zoneForm.leaderName.trim(),
        leaderPhone: zoneForm.leaderPhone.trim(),
      };
      const path = editingZoneId ? `/api/zones/${editingZoneId}` : '/api/zones';
      const method = editingZoneId ? 'PUT' : 'POST';
      const payload = await apiRequest(path, { method, body, token: session.accessToken });
      await loadZones();
      resetZoneForm();
      return { ...payload, message: editingZoneId ? 'Zone updated successfully.' : 'Zone created successfully.' };
    });
  };

  const handleEditZone = (zoneId) => {
    runAction('zone-edit', async () => {
      const payload = await apiRequest(`/api/zones/${zoneId}`, { token: session.accessToken });
      const zone = payload.data ?? {};
      setEditingZoneId(zone.id);
      setZoneForm({
        name: zone.name ?? '',
        leaderName: zone.leaderName ?? '',
        leaderPhone: zone.leaderPhone ?? '',
      });
      return { ...payload, message: 'Zone loaded for editing.' };
    });
  };

  const handleDeleteZone = (zoneId) => {
    runAction('zone-delete', async () => {
      const payload = await apiRequest(`/api/zones/${zoneId}`, { method: 'DELETE', token: session.accessToken });
      await loadZones();
      if (editingZoneId === zoneId) resetZoneForm();
      return { ...payload, message: 'Zone deleted successfully.' };
    });
  };

  const resetResourceForm = (resourceKey) => {
    setEditingResourceIds((current) => ({ ...current, [resourceKey]: null }));
    setResourceForms((current) => ({ ...current, [resourceKey]: resourceConfigs[resourceKey].emptyForm }));
  };

  const buildResourceBody = (resourceKey) => {
    const form = resourceForms[resourceKey];
    const body = {};

    resourceConfigs[resourceKey].fields.forEach((field) => {
      const value = form[field.name];
      if (field.type === 'zone-select') {
        const zoneId = Number(value);
        const zoneExists = zones.some((zone) => Number(zone.id) === zoneId);

        if (!Number.isInteger(zoneId) || zoneId <= 0 || !zoneExists) {
          throw new Error('Select a valid zone before saving this section.');
        }

        body[field.name] = zoneId;
        return;
      }

      const fieldValue = String(value ?? '').trim();
      if (field.required && !fieldValue) throw new Error(`${field.label} is required.`);
      body[field.name] = fieldValue;
    });

    return body;
  };

  const handleResourceSubmit = (event, resourceKey) => {
    event.preventDefault();
    const config = resourceConfigs[resourceKey];
    const editingId = editingResourceIds[resourceKey];

    runAction(`${resourceKey}-save`, async () => {
      const body = buildResourceBody(resourceKey);
      const path = editingId ? `${config.path}/${editingId}` : config.path;
      const method = editingId ? 'PUT' : 'POST';
      const payload = await apiRequest(path, { method, body, token: session.accessToken });
      await loadResource(resourceKey);
      resetResourceForm(resourceKey);
      return {
        ...payload,
        message: editingId
          ? `${formatMetricLabel(config.singular)} updated successfully.`
          : `${formatMetricLabel(config.singular)} created successfully.`,
      };
    });
  };

  const handleEditResource = (resourceKey, itemId) => {
    const config = resourceConfigs[resourceKey];
    runAction(`${resourceKey}-edit`, async () => {
      const payload = await apiRequest(`${config.path}/${itemId}`, { token: session.accessToken });
      const item = payload.data ?? {};
      const nextForm = {};
      config.fields.forEach((field) => {
        nextForm[field.name] = item[field.name] ?? '';
      });
      setEditingResourceIds((current) => ({ ...current, [resourceKey]: item.id }));
      setResourceForms((current) => ({ ...current, [resourceKey]: nextForm }));
      return { ...payload, message: `${formatMetricLabel(config.singular)} loaded for editing.` };
    });
  };

  const handleDeleteResource = (resourceKey, itemId) => {
    const config = resourceConfigs[resourceKey];
    runAction(`${resourceKey}-delete`, async () => {
      const payload = await apiRequest(`${config.path}/${itemId}`, { method: 'DELETE', token: session.accessToken });
      await loadResource(resourceKey);
      if (editingResourceIds[resourceKey] === itemId) resetResourceForm(resourceKey);
      return { ...payload, message: `${formatMetricLabel(config.singular)} deleted successfully.` };
    });
  };

  const resetMemberForm = () => {
    setEditingMemberId(null);
    setMemberForm(emptyMemberForm);
  };

  const buildMemberBody = () => {
    const required = [
      ['zoneId', 'Zone'],
      ['surname', 'Surname'],
      ['firstNames', 'First names'],
      ['cell', 'Cell'],
    ];
    required.forEach(([name, label]) => {
      if (!String(memberForm[name] ?? '').trim()) throw new Error(`${label} is required.`);
    });

    return {
      membershipNo: toOptionalString(memberForm.membershipNo),
      zoneId: Number(memberForm.zoneId),
      sectionId: toOptionalNumber(memberForm.sectionId),
      massCentreId: toOptionalNumber(memberForm.massCentreId),
      surname: memberForm.surname.trim(),
      firstNames: memberForm.firstNames.trim(),
      homeAddress: toOptionalString(memberForm.homeAddress),
      emailAddress: toOptionalString(memberForm.emailAddress),
      telephone: toOptionalString(memberForm.telephone),
      cell: memberForm.cell.trim(),
      baptismPlace: toOptionalString(memberForm.baptismPlace),
      baptismDate: toOptionalString(memberForm.baptismDate),
      confirmationDate: toOptionalString(memberForm.confirmationDate),
      marriageDate: toOptionalString(memberForm.marriageDate),
      parishPriestName: toOptionalString(memberForm.parishPriestName),
      dateOfIssue: toOptionalString(memberForm.dateOfIssue),
      status: memberForm.status,
    };
  };

  const handleMemberSubmit = (event) => {
    event.preventDefault();
    runAction('member-save', async () => {
      const body = buildMemberBody();
      const path = editingMemberId ? `/api/members/${editingMemberId}` : '/api/members';
      const method = editingMemberId ? 'PUT' : 'POST';
      const payload = await apiRequest(path, { method, body, token: session.accessToken });
      const savedMember = payload.data;
      await loadMembers();
      if (savedMember?.id) await refreshSelectedMember(savedMember.id);
      resetMemberForm();
      setActiveMemberTab('directory');
      return { ...payload, message: editingMemberId ? 'Member updated successfully.' : 'Member created successfully.' };
    });
  };

  const handleEditMember = (memberId) => {
    runAction('member-edit', async () => {
      const payload = await refreshSelectedMember(memberId);
      const member = payload.data ?? {};
      setEditingMemberId(member.id);
      setMemberForm({
        membershipNo: member.membershipNo ?? '',
        zoneId: member.zoneId ?? '',
        sectionId: member.sectionId ?? '',
        massCentreId: member.massCentreId ?? '',
        surname: member.surname ?? '',
        firstNames: member.firstNames ?? '',
        homeAddress: member.homeAddress ?? '',
        emailAddress: member.emailAddress ?? '',
        telephone: member.telephone ?? '',
        cell: member.cell ?? '',
        baptismPlace: member.baptismPlace ?? '',
        baptismDate: member.baptismDate ?? '',
        confirmationDate: member.confirmationDate ?? '',
        marriageDate: member.marriageDate ?? '',
        parishPriestName: member.parishPriestName ?? '',
        dateOfIssue: member.dateOfIssue ?? '',
        status: member.status ?? 'ACTIVE',
      });
      setActiveMemberTab('add');
      return { ...payload, message: 'Member loaded for editing.' };
    });
  };

  const handleDeleteMember = (memberId) => {
    runAction('member-delete', async () => {
      const payload = await apiRequest(`/api/members/${memberId}`, { method: 'DELETE', token: session.accessToken });
      await loadMembers();
      if (selectedMember?.id === memberId) setSelectedMember(null);
      if (editingMemberId === memberId) resetMemberForm();
      setMemberStatement(null);
      setContributionSummary(null);
      if (paymentForm.memberId === String(memberId)) resetPaymentForm();
      return { ...payload, message: 'Member deleted successfully.' };
    });
  };

  const handleSearchMembers = (event) => {
    event.preventDefault();
    loadMembers(session.accessToken, memberFilters);
  };

  const handleSelectMember = (memberId) => {
    runAction('member-select', async () => {
      const payload = await refreshSelectedMember(memberId);
      setMemberStatement(null);
      setContributionSummary(null);
      await preparePaymentForMember(memberId);
      return { ...payload, message: 'Member profile loaded.' };
    });
  };

  const handleAssociation = (kind, action, itemId) => {
    if (!selectedMember?.id || !itemId) return;
    const plural = kind === 'ministry' ? 'ministries' : 'guilds';
    runAction(`${kind}-${action}`, async () => {
      const method = action === 'add' ? 'POST' : 'DELETE';
      const payload = await apiRequest(`/api/members/${selectedMember.id}/${plural}/${itemId}`, {
        method,
        token: session.accessToken,
      });
      await refreshSelectedMember(selectedMember.id);
      await loadMembers();
      setAssociationForm({ ministryId: '', guildId: '' });
      return { ...payload, message: `${formatMetricLabel(kind)} ${action === 'add' ? 'added' : 'removed'} successfully.` };
    });
  };

  const loadStatement = () => {
    if (!selectedMember?.id) return;
    runAction('member-statement', async () => {
      const params = new URLSearchParams();
      if (statementFilters.fromDate) params.set('fromDate', statementFilters.fromDate);
      if (statementFilters.toDate) params.set('toDate', statementFilters.toDate);
      const query = params.toString() ? `?${params.toString()}` : '';
      const payload = await apiRequest(`/api/members/${selectedMember.id}/statement${query}`, {
        token: session.accessToken,
      });
      setMemberStatement(payload.data ?? null);
      return { ...payload, message: 'Statement loaded.' };
    });
  };

  const loadContributions = () => {
    if (!selectedMember?.id) return;
    runAction('member-contributions', async () => {
      const year = Number(contributionYear);
      if (!Number.isInteger(year) || year < 2000) throw new Error('Enter a valid contribution year.');
      const payload = await apiRequest(`/api/members/${selectedMember.id}/contributions/${year}`, {
        token: session.accessToken,
      });
      setContributionSummary(payload.data ?? null);
      return { ...payload, message: 'Contribution summary loaded.' };
    });
  };

  const handleDownloadContributionsPdf = () => {
    if (!selectedMember?.id) return;
    runAction('member-contributions-pdf', async () => {
      const year = Number(contributionYear);
      if (!Number.isInteger(year) || year < 2000) throw new Error('Enter a valid contribution year.');
      const summary =
        contributionSummary?.year === year
          ? contributionSummary
          : (
              await apiRequest(`/api/members/${selectedMember.id}/contributions/${year}`, {
                token: session.accessToken,
              })
            ).data;
      if (!summary) throw new Error('Contribution summary could not be loaded.');
      setContributionSummary(summary);
      const memberName = fullName(selectedMember).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'member';
      downloadContributionPdf(`${memberName}-contributions-${year}.pdf`, {
        member: selectedMember,
        summary,
        generatedAt: new Date().toLocaleString(),
      });
      return { success: true, message: 'Contribution PDF downloaded.' };
    });
  };

  const completeLoginSession = async (authData) => {
    let nextSession = authData;

    if (authData.refreshToken) {
      const refreshed = await apiRequest('/api/auth/refresh-token', {
        method: 'POST',
        body: { refreshToken: authData.refreshToken },
      });
      nextSession = refreshed.data ?? authData;
    }

    if (nextSession.accessToken) {
      const profile = await apiRequest('/api/auth/me', { token: nextSession.accessToken });
      nextSession = { ...nextSession, user: profile.data ?? nextSession.user };
      await loadDashboard(nextSession.accessToken);
      await loadZones(nextSession.accessToken);
      await loadMembers(nextSession.accessToken, { keyword: '', zoneId: '' });
      await loadBillingItems(nextSession.accessToken);
      await loadPayments(nextSession.accessToken, { mode: 'all', memberId: '', receiptNo: '' });
      await Promise.all(Object.keys(resourceConfigs).map((key) => loadResource(key, nextSession.accessToken)));
    }

    setSession(nextSession);
    return { success: true, message: 'Signed in successfully.', data: nextSession.user };
  };

  const handleLogin = (event) => {
    event.preventDefault();
    runAction('login', async () => {
      const payload = await apiRequest('/api/auth/login', { method: 'POST', body: loginForm });
      const authData = payload.data ?? {};
      return completeLoginSession(authData);
    });
  };

  const handleRegister = (event) => {
    event.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      setToast({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    runAction('register', async () => {
      const body = { username: registerForm.username, password: registerForm.password, role: 'MEMBER' };
      const payload = await apiRequest('/api/auth/register', { method: 'POST', body, token: session.accessToken });
      if (session.refreshToken) {
        await apiRequest('/api/auth/refresh-token', { method: 'POST', body: { refreshToken: session.refreshToken } });
      }
      return payload;
    });
  };

  const showDashboard = activeSection === 'dashboard';
  const showMembers = activeSection === 'members';
  const showBilling = activeSection === 'billing';
  const showPayments = activeSection === 'payments';
  const showReports = activeSection === 'reports';
  const showSettings = activeSection === 'settings';
  const dashboardEntries = Object.entries(dashboard ?? {});
  const activeResourceConfig = resourceConfigs[activeSettingTab];
  const activeResourceRows = resourceData[activeSettingTab] ?? [];
  const activeResourceForm = resourceForms[activeSettingTab] ?? {};
  const activeResourceEditingId = editingResourceIds[activeSettingTab];
  const selectedMinistries = selectedMember?.ministries ?? [];
  const selectedGuilds = selectedMember?.guilds ?? [];
  const availableMinistries = ministries.filter((ministry) => !selectedMinistries.includes(ministry.name));
  const availableGuilds = guilds.filter((guild) => !selectedGuilds.includes(guild.name));
  const totalOutstanding = memberBills.reduce((sum, bill) => sum + Number(bill.balance ?? 0), 0);
  const totalBilled = memberBills.reduce((sum, bill) => sum + Number(bill.amount ?? 0), 0);
  const paymentBillBalance = paymentBills.reduce((sum, bill) => sum + Number(bill.balance ?? 0), 0);
  const paymentBalanceCurrency = paymentBills[0]?.currency || paymentForm.currency || 'USD';
  const selectedMemberBalance =
    selectedMember && paymentForm.memberId === String(selectedMember.id)
      ? Number(memberStatement?.currentBalance ?? paymentBillBalance)
      : null;
  const totalPayments = payments
    .filter((payment) => !payment.reversed)
    .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const activeReportTab = reportTabs.find((tab) => tab.key === activeReportKey) ?? reportTabs[0];
  const reportRows = getReportRows(reportResult?.data);
  const reportEntries = getReportEntries(reportResult?.data);
  const reportColumns = getReportColumns(reportRows);

  if (session.accessToken) {
    return (
      <main className="dashboard-shell">
        <nav className="dashboard-topbar" aria-label="Application header">
          <div className="brand-group">
            <div className="brand-mark">
              <Building2 size={20} />
            </div>
            <div>
              <strong>Our Lady of Wisdom</strong>
              <span>Parish dashboard</span>
            </div>
          </div>
          <div className="app-actions">
            <div className="app-nav" aria-label="Primary navigation">
              <button className={showDashboard ? 'active' : ''} onClick={() => setActiveSection('dashboard')}>
                <LayoutDashboard size={17} />
                Dashboard
              </button>
              <button className={showMembers ? 'active' : ''} onClick={() => setActiveSection('members')}>
                <Users size={17} />
                Members
              </button>
              <button className={showBilling ? 'active' : ''} onClick={() => setActiveSection('billing')}>
                <FileText size={17} />
                Billing
              </button>
              <button className={showPayments ? 'active' : ''} onClick={() => setActiveSection('payments')}>
                <CreditCard size={17} />
                Payments
              </button>
              <button className={showReports ? 'active' : ''} onClick={() => setActiveSection('reports')}>
                <BarChart3 size={17} />
                Reports
              </button>
              <button className={showSettings ? 'active' : ''} onClick={() => setActiveSection('settings')}>
                <Settings size={17} />
                Settings
              </button>
            </div>
            <button className="secondary-button" onClick={() => endSession()}>
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </nav>

        {showDashboard && (
          <>
            <section className="dashboard-hero">
              <div>
                <span className="dashboard-kicker">Dashboard</span>
                <h1>Welcome, {session.user?.username ?? 'User'}</h1>
                <p>{session.user?.role ? session.user.role.replaceAll('_', ' ') : 'Signed in'}</p>
              </div>
              <button className="secondary-button" onClick={() => loadDashboard()} disabled={dashboardLoading}>
                {dashboardLoading ? <Loader2 className="spin" size={17} /> : <RefreshCw size={17} />}
                Refresh
              </button>
            </section>

            {dashboardError && <div className="dashboard-alert">{dashboardError}</div>}

            <section className="metric-grid" aria-label="Dashboard summary">
              {dashboardLoading && !dashboard ? (
                <article className="metric-card metric-card-wide">
                  <Loader2 className="spin" size={22} />
                  <span>Loading dashboard</span>
                  <strong>Please wait</strong>
                </article>
              ) : dashboardEntries.length > 0 ? (
                dashboardEntries.map(([key, value]) => (
                  <article className="metric-card" key={key}>
                    <BarChart3 size={22} />
                    <span>{formatMetricLabel(key)}</span>
                    {isMetricBreakdown(value) ? (
                      <div className="metric-breakdown">
                        {Object.entries(value).length > 0 ? (
                          Object.entries(value).map(([label, amount]) => (
                            <div className="metric-breakdown-row" key={label}>
                              <small>{label}</small>
                              <strong>{formatBreakdownValue(amount)}</strong>
                            </div>
                          ))
                        ) : (
                          <strong>N/A</strong>
                        )}
                      </div>
                    ) : (
                      <strong>{formatMetricValue(value)}</strong>
                    )}
                  </article>
                ))
              ) : (
                <article className="metric-card metric-card-wide">
                  <LayoutDashboard size={22} />
                  <span>Dashboard summary</span>
                  <strong>No metrics available yet</strong>
                </article>
              )}
            </section>
          </>
        )}

        {showMembers && (
          <section className="settings-page members-page">
            <div className="settings-heading">
              <div>
                <span className="dashboard-kicker">Membership</span>
                <h1>Member management</h1>
                <p>Register members, manage parish affiliations, and review statements and contributions.</p>
              </div>
              <button className="secondary-button" onClick={() => loadMembers()} disabled={membersLoading}>
                {membersLoading ? <Loader2 className="spin" size={17} /> : <RefreshCw size={17} />}
                Refresh
              </button>
            </div>

            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
            {membersError && <div className="dashboard-alert">{membersError}</div>}

            <div className="settings-tabs member-tabs" aria-label="Member pages">
              <button
                className={activeMemberTab === 'add' ? 'active' : ''}
                onClick={() => setActiveMemberTab('add')}
              >
                Add member
              </button>
              <button
                className={activeMemberTab === 'directory' ? 'active' : ''}
                onClick={() => setActiveMemberTab('directory')}
              >
                Member directory
              </button>
            </div>

            <div className={`members-layout member-${activeMemberTab}-layout`}>
              {activeMemberTab === 'add' && (
              <section className="settings-card member-form-card">
                <div className="settings-card-heading">
                  <UserPlus size={21} />
                  <div>
                    <h2>{editingMemberId ? 'Edit member' : 'Add member'}</h2>
                    <p>{editingMemberId ? 'Update the selected member record.' : 'Create a parish membership profile.'}</p>
                  </div>
                </div>

                <form className="form-stack" onSubmit={handleMemberSubmit}>
                  <div className="form-grid two-columns">
                    <label>
                      Membership no
                      <input
                        value={memberForm.membershipNo}
                        onChange={(event) => setMemberForm({ ...memberForm, membershipNo: event.target.value })}
                        placeholder="Optional"
                      />
                    </label>
                    <label>
                      Status
                      <select
                        value={memberForm.status}
                        onChange={(event) => setMemberForm({ ...memberForm, status: event.target.value })}
                      >
                        {memberStatuses.map((status) => (
                          <option value={status} key={status}>
                            {formatMetricLabel(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      First names
                      <input
                        value={memberForm.firstNames}
                        onChange={(event) => setMemberForm({ ...memberForm, firstNames: event.target.value })}
                        placeholder="First names"
                        required
                      />
                    </label>
                    <label>
                      Surname
                      <input
                        value={memberForm.surname}
                        onChange={(event) => setMemberForm({ ...memberForm, surname: event.target.value })}
                        placeholder="Surname"
                        required
                      />
                    </label>
                    <label>
                      Cell
                      <input
                        value={memberForm.cell}
                        onChange={(event) => setMemberForm({ ...memberForm, cell: event.target.value })}
                        placeholder="Primary mobile number"
                        required
                      />
                    </label>
                    <label>
                      Telephone
                      <input
                        value={memberForm.telephone}
                        onChange={(event) => setMemberForm({ ...memberForm, telephone: event.target.value })}
                        placeholder="Optional"
                      />
                    </label>
                    <label>
                      Email
                      <input
                        value={memberForm.emailAddress}
                        onChange={(event) => setMemberForm({ ...memberForm, emailAddress: event.target.value })}
                        placeholder="name@example.com"
                        type="email"
                      />
                    </label>
                    <label>
                      Zone
                      <select
                        value={memberForm.zoneId}
                        onChange={(event) =>
                          setMemberForm({ ...memberForm, zoneId: event.target.value, sectionId: '' })
                        }
                        disabled={zonesLoading || zones.length === 0}
                        required
                      >
                        <option value="">{zones.length === 0 ? 'Create a zone first' : 'Select a zone'}</option>
                        {zones.map((zone) => (
                          <option value={zone.id} key={zone.id}>
                            {zone.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Section
                      <select
                        value={memberForm.sectionId}
                        onChange={(event) => setMemberForm({ ...memberForm, sectionId: event.target.value })}
                      >
                        <option value="">No section</option>
                        {filteredSections.map((section) => (
                          <option value={section.id} key={section.id}>
                            {section.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Mass centre
                      <select
                        value={memberForm.massCentreId}
                        onChange={(event) => setMemberForm({ ...memberForm, massCentreId: event.target.value })}
                      >
                        <option value="">No mass centre</option>
                        {massCentres.map((centre) => (
                          <option value={centre.id} key={centre.id}>
                            {centre.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label>
                    Home address
                    <input
                      value={memberForm.homeAddress}
                      onChange={(event) => setMemberForm({ ...memberForm, homeAddress: event.target.value })}
                      placeholder="Optional"
                    />
                  </label>

                  <div className="form-grid two-columns">
                    <label>
                      Baptism place
                      <input
                        value={memberForm.baptismPlace}
                        onChange={(event) => setMemberForm({ ...memberForm, baptismPlace: event.target.value })}
                        placeholder="Optional"
                      />
                    </label>
                    <label>
                      Baptism date
                      <input
                        value={memberForm.baptismDate}
                        onChange={(event) => setMemberForm({ ...memberForm, baptismDate: event.target.value })}
                        type="date"
                      />
                    </label>
                    <label>
                      Confirmation date
                      <input
                        value={memberForm.confirmationDate}
                        onChange={(event) => setMemberForm({ ...memberForm, confirmationDate: event.target.value })}
                        type="date"
                      />
                    </label>
                    <label>
                      Marriage date
                      <input
                        value={memberForm.marriageDate}
                        onChange={(event) => setMemberForm({ ...memberForm, marriageDate: event.target.value })}
                        type="date"
                      />
                    </label>
                    <label>
                      Parish priest
                      <input
                        value={memberForm.parishPriestName}
                        onChange={(event) => setMemberForm({ ...memberForm, parishPriestName: event.target.value })}
                        placeholder="Optional"
                      />
                    </label>
                    <label>
                      Date of issue
                      <input
                        value={memberForm.dateOfIssue}
                        onChange={(event) => setMemberForm({ ...memberForm, dateOfIssue: event.target.value })}
                        type="date"
                      />
                    </label>
                  </div>

                  <div className="form-actions">
                    <button className="primary-button" disabled={busyAction === 'member-save' || zones.length === 0}>
                      {busyAction === 'member-save' ? (
                        <Loader2 className="spin" size={18} />
                      ) : editingMemberId ? (
                        <Save size={18} />
                      ) : (
                        <Plus size={18} />
                      )}
                      {editingMemberId ? 'Save changes' : 'Create member'}
                    </button>
                    {editingMemberId && (
                      <button type="button" className="secondary-button" onClick={resetMemberForm}>
                        <X size={17} />
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </section>
              )}

              {activeMemberTab === 'directory' && (
              <>
              <section className="settings-card member-directory-card">
                <div className="settings-card-heading">
                  <Users size={21} />
                  <div>
                    <h2>Member directory</h2>
                    <p>
                      {members.length} {members.length === 1 ? 'member' : 'members'} loaded.
                    </p>
                  </div>
                </div>

                <form className="member-filter-bar" onSubmit={handleSearchMembers}>
                  <label>
                    Search
                    <input
                      value={memberFilters.keyword}
                      onChange={(event) => setMemberFilters({ ...memberFilters, keyword: event.target.value })}
                      placeholder="Name or membership no"
                    />
                  </label>
                  <label>
                    Zone
                    <select
                      value={memberFilters.zoneId}
                      onChange={(event) =>
                        setMemberFilters({ ...memberFilters, zoneId: event.target.value, keyword: '' })
                      }
                    >
                      <option value="">All zones</option>
                      {zones.map((zone) => (
                        <option value={zone.id} key={zone.id}>
                          {zone.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="secondary-button" disabled={membersLoading}>
                    {membersLoading ? <Loader2 className="spin" size={17} /> : <Search size={17} />}
                    Find
                  </button>
                </form>

                {membersLoading ? (
                  <div className="empty-table-state">
                    <Loader2 className="spin" size={22} />
                    <strong>Loading members</strong>
                  </div>
                ) : members.length > 0 ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Membership no</th>
                          <th>Zone</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr className={selectedMember?.id === member.id ? 'selected-row' : ''} key={member.id}>
                            <td>
                              <strong>{fullName(member)}</strong>
                              <span className="table-subtext">{member.cell || member.emailAddress || 'No contact'}</span>
                            </td>
                            <td>{member.membershipNo || 'N/A'}</td>
                            <td>{member.zone || 'N/A'}</td>
                            <td>
                              <span className={`status-pill ${String(member.status || '').toLowerCase()}`}>
                                {formatMetricLabel(member.status || 'UNKNOWN')}
                              </span>
                            </td>
                            <td>
                              <div className="row-actions">
                                <button onClick={() => handleSelectMember(member.id)} disabled={busyAction === 'member-select'}>
                                  <UserCheck size={16} />
                                  Open
                                </button>
                                <button onClick={() => handleEditMember(member.id)} disabled={busyAction === 'member-edit'}>
                                  <Edit3 size={16} />
                                  Edit
                                </button>
                                <button
                                  className="danger-button"
                                  onClick={() => handleDeleteMember(member.id)}
                                  disabled={busyAction === 'member-delete'}
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-table-state">
                    <Users size={22} />
                    <strong>No members found</strong>
                    <span>Create a member or adjust the filters.</span>
                  </div>
                )}
              </section>

              <section className="settings-card member-detail-card">
                <div className="settings-card-heading">
                  <FileText size={21} />
                  <div>
                    <h2>{selectedMember ? fullName(selectedMember) : 'Member profile'}</h2>
                    <p>{selectedMember ? selectedMember.membershipNo || 'Membership number not assigned' : 'Open a member to manage affiliations and history.'}</p>
                  </div>
                </div>

                {selectedMember ? (
                  <div className="member-detail-stack">
                    <div className="detail-grid">
                      <span>Zone<strong>{selectedMember.zone || 'N/A'}</strong></span>
                      <span>Section<strong>{selectedMember.section || 'N/A'}</strong></span>
                      <span>Mass centre<strong>{selectedMember.massCentre || 'N/A'}</strong></span>
                      <span>Contact<strong>{selectedMember.cell || selectedMember.telephone || 'N/A'}</strong></span>
                    </div>

                    <div className="association-grid">
                      <section>
                        <h3>Ministries</h3>
                        <div className="chip-list">
                          {selectedMinistries.length > 0 ? (
                            selectedMinistries.map((name) => {
                              const ministry = ministries.find((item) => item.name === name);
                              return (
                                <button
                                  type="button"
                                  className="removable-chip"
                                  key={name}
                                  onClick={() => ministry && handleAssociation('ministry', 'remove', ministry.id)}
                                  disabled={!ministry || busyAction === 'ministry-remove'}
                                >
                                  {name}
                                  <X size={14} />
                                </button>
                              );
                            })
                          ) : (
                            <span className="muted-text">None assigned</span>
                          )}
                        </div>
                        <div className="inline-controls">
                          <select
                            value={associationForm.ministryId}
                            onChange={(event) => setAssociationForm({ ...associationForm, ministryId: event.target.value })}
                          >
                            <option value="">Add ministry</option>
                            {availableMinistries.map((ministry) => (
                              <option value={ministry.id} key={ministry.id}>
                                {ministry.name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="secondary-button"
                            onClick={() => handleAssociation('ministry', 'add', associationForm.ministryId)}
                            disabled={!associationForm.ministryId || busyAction === 'ministry-add'}
                          >
                            <Plus size={17} />
                          </button>
                        </div>
                      </section>

                      <section>
                        <h3>Guilds</h3>
                        <div className="chip-list">
                          {selectedGuilds.length > 0 ? (
                            selectedGuilds.map((name) => {
                              const guild = guilds.find((item) => item.name === name);
                              return (
                                <button
                                  type="button"
                                  className="removable-chip"
                                  key={name}
                                  onClick={() => guild && handleAssociation('guild', 'remove', guild.id)}
                                  disabled={!guild || busyAction === 'guild-remove'}
                                >
                                  {name}
                                  <X size={14} />
                                </button>
                              );
                            })
                          ) : (
                            <span className="muted-text">None assigned</span>
                          )}
                        </div>
                        <div className="inline-controls">
                          <select
                            value={associationForm.guildId}
                            onChange={(event) => setAssociationForm({ ...associationForm, guildId: event.target.value })}
                          >
                            <option value="">Add guild</option>
                            {availableGuilds.map((guild) => (
                              <option value={guild.id} key={guild.id}>
                                {guild.name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="secondary-button"
                            onClick={() => handleAssociation('guild', 'add', associationForm.guildId)}
                            disabled={!associationForm.guildId || busyAction === 'guild-add'}
                          >
                            <Plus size={17} />
                          </button>
                        </div>
                      </section>
                    </div>

                    <section className="history-panel member-payment-panel">
                      <div className="panel-title-row">
                        <h3>Post payment</h3>
                        <button
                          className="secondary-button"
                          onClick={() => preparePaymentForMember(selectedMember.id)}
                          disabled={paymentBillsLoading}
                        >
                          {paymentBillsLoading ? <Loader2 className="spin" size={17} /> : <RefreshCw size={17} />}
                          Refresh bills
                        </button>
                      </div>

                      <div className="member-balance-strip">
                        <span>Current balance<strong>{formatCurrency(selectedMemberBalance ?? paymentBillBalance, paymentBalanceCurrency)}</strong></span>
                        <span>Selected allocation<strong>{formatCurrency(paymentAllocationTotal, paymentBalanceCurrency)}</strong></span>
                      </div>

                      <form className="form-stack compact-payment-form" onSubmit={handlePaymentSubmit}>
                        <div className="form-grid two-columns">
                          <label>
                            Member
                            <input value={`${fullName(selectedMember)}${selectedMember.membershipNo ? ` (${selectedMember.membershipNo})` : ''}`} readOnly />
                          </label>
                          <label>
                            Payment date
                            <input
                              value={paymentForm.paymentDate}
                              onChange={(event) => setPaymentForm({ ...paymentForm, paymentDate: event.target.value })}
                              type="date"
                              required
                            />
                          </label>
                          <label>
                            Method
                            <select
                              value={paymentForm.paymentMethod}
                              onChange={(event) => setPaymentForm({ ...paymentForm, paymentMethod: event.target.value })}
                            >
                              {paymentMethods.map((method) => (
                                <option value={method} key={method}>
                                  {formatMetricLabel(method)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Currency
                            <input
                              value={paymentForm.currency}
                              onChange={(event) => setPaymentForm({ ...paymentForm, currency: event.target.value })}
                              placeholder="USD"
                              required
                            />
                          </label>
                          <label>
                            Reference
                            <input
                              value={paymentForm.paymentReference}
                              onChange={(event) => setPaymentForm({ ...paymentForm, paymentReference: event.target.value })}
                              placeholder="Optional"
                            />
                          </label>
                          <label>
                            Allocation total
                            <input value={paymentAllocationTotal.toFixed(2)} readOnly />
                          </label>
                        </div>
                        <label>
                          Notes
                          <input
                            value={paymentForm.notes}
                            onChange={(event) => setPaymentForm({ ...paymentForm, notes: event.target.value })}
                            placeholder="Optional"
                          />
                        </label>

                        {paymentBillsLoading ? (
                          <div className="empty-table-state compact-empty-state">
                            <Loader2 className="spin" size={22} />
                            <strong>Loading outstanding bills</strong>
                          </div>
                        ) : paymentBills.length > 0 ? (
                          <div className="table-wrap member-payment-table">
                            <table>
                              <thead>
                                <tr>
                                  <th>Bill</th>
                                  <th>Period</th>
                                  <th>Balance</th>
                                  <th>Allocate</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paymentBills.map((bill) => (
                                  <tr key={bill.id}>
                                    <td>
                                      <strong>{bill.billingItem}</strong>
                                      <span className="table-subtext">{formatMetricLabel(bill.status)}</span>
                                    </td>
                                    <td>
                                      {bill.month} {bill.year}
                                    </td>
                                    <td>{formatCurrency(bill.balance, bill.currency)}</td>
                                    <td>
                                      <input
                                        value={paymentAllocations[bill.id] ?? ''}
                                        onChange={(event) => setAllocationAmount(bill.id, event.target.value)}
                                        max={bill.balance}
                                        min="0"
                                        step="0.01"
                                        type="number"
                                        placeholder="0.00"
                                      />
                                    </td>
                                    <td>
                                      <div className="row-actions">
                                        <button type="button" onClick={() => setAllocationAmount(bill.id, bill.balance)}>
                                          Full
                                        </button>
                                        <button type="button" onClick={() => setAllocationAmount(bill.id, '')}>
                                          Clear
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="empty-table-state compact-empty-state">
                            <CreditCard size={22} />
                            <strong>No unpaid bills</strong>
                            <span>This member has no bill balances to allocate.</span>
                          </div>
                        )}

                        <div className="form-actions">
                          <button
                            className="primary-button"
                            disabled={busyAction === 'payment-save' || paymentAllocationTotal <= 0 || paymentBills.length === 0}
                          >
                            {busyAction === 'payment-save' ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
                            Post payment
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => preparePaymentForMember(selectedMember.id)}
                          >
                            <X size={17} />
                            Clear
                          </button>
                        </div>
                      </form>

                      {selectedPayment && paymentForm.memberId === String(selectedMember.id) && (
                        <div className="member-payment-receipt">
                          <span>Receipt<strong>{selectedPayment.receiptNo}</strong></span>
                          <span>Amount<strong>{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</strong></span>
                          <span>Status<strong>{selectedPayment.reversed ? 'Reversed' : 'Valid'}</strong></span>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => handleDownloadPaymentReceipt(selectedPayment, selectedMemberBalance ?? paymentBillBalance)}
                          >
                            <Download size={17} />
                            Download PDF
                          </button>
                        </div>
                      )}
                    </section>

                    <section className="history-panel">
                      <div className="panel-title-row">
                        <h3>Statement</h3>
                        <button className="secondary-button" onClick={loadStatement} disabled={busyAction === 'member-statement'}>
                          {busyAction === 'member-statement' ? <Loader2 className="spin" size={17} /> : <FileText size={17} />}
                          Load
                        </button>
                      </div>
                      <div className="member-filter-bar compact">
                        <label>
                          From
                          <input
                            value={statementFilters.fromDate}
                            onChange={(event) => setStatementFilters({ ...statementFilters, fromDate: event.target.value })}
                            type="date"
                          />
                        </label>
                        <label>
                          To
                          <input
                            value={statementFilters.toDate}
                            onChange={(event) => setStatementFilters({ ...statementFilters, toDate: event.target.value })}
                            type="date"
                          />
                        </label>
                      </div>
                      {memberStatement && (
                        <>
                          <div className="detail-grid money-grid">
                            <span>Opening<strong>{formatCurrency(memberStatement.openingBalance)}</strong></span>
                            <span>Current<strong>{formatCurrency(memberStatement.currentBalance)}</strong></span>
                          </div>
                          <div className="mini-table-grid">
                            <div>
                              <h4>Bills</h4>
                              {(memberStatement.bills ?? []).slice(0, 6).map((bill) => (
                                <span className="mini-row" key={bill.id}>
                                  {bill.billingItem}
                                  <strong>{formatCurrency(bill.balance, bill.currency)}</strong>
                                </span>
                              ))}
                              {(memberStatement.bills ?? []).length === 0 && <span className="muted-text">No bills</span>}
                            </div>
                            <div>
                              <h4>Payments</h4>
                              {(memberStatement.payments ?? []).slice(0, 6).map((payment) => (
                                <span className="mini-row" key={payment.id}>
                                  <span>
                                    {payment.receiptNo || payment.paymentMethod}
                                    <small>{formatCurrency(payment.amount, payment.currency)}</small>
                                  </span>
                                  <button type="button" onClick={() => handleDownloadPaymentReceipt(payment, memberStatement.currentBalance)}>
                                    <Download size={15} />
                                    PDF
                                  </button>
                                </span>
                              ))}
                              {(memberStatement.payments ?? []).length === 0 && <span className="muted-text">No payments</span>}
                            </div>
                          </div>
                        </>
                      )}
                    </section>

                    <section className="history-panel">
                      <div className="panel-title-row">
                        <h3>Contributions</h3>
                        <div className="row-actions">
                          <button
                            className="secondary-button"
                            onClick={loadContributions}
                            disabled={busyAction === 'member-contributions'}
                          >
                            {busyAction === 'member-contributions' ? (
                              <Loader2 className="spin" size={17} />
                            ) : (
                              <BookOpenCheck size={17} />
                            )}
                            Load
                          </button>
                          <button
                            className="secondary-button"
                            onClick={handleDownloadContributionsPdf}
                            disabled={busyAction === 'member-contributions-pdf'}
                          >
                            {busyAction === 'member-contributions-pdf' ? (
                              <Loader2 className="spin" size={17} />
                            ) : (
                              <Download size={17} />
                            )}
                            PDF
                          </button>
                        </div>
                      </div>
                      <label>
                        Year
                        <input
                          value={contributionYear}
                          onChange={(event) => setContributionYear(event.target.value)}
                          type="number"
                          min="2000"
                        />
                      </label>
                      {contributionSummary?.months?.length > 0 && (
                        <div className="contribution-grid">
                          {contributionSummary.months.map((month) => {
                            const paid = Number(month.paid ?? 0);
                            const billed = Number(month.billed ?? 0);
                            const balance = Number(month.balance ?? 0);
                            const paymentClass =
                              paid <= 0 ? '' : balance <= 0 || (billed > 0 && paid >= billed) ? 'fully-paid' : 'partially-paid';
                            return (
                              <span className={`month-tile ${paymentClass}`} key={month.month}>
                                {month.month}
                                <strong>{formatCurrency(month.paid)}</strong>
                                <small>{formatMetricLabel(month.status)}</small>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  </div>
                ) : (
                  <div className="empty-table-state">
                    <UserCheck size={22} />
                    <strong>No member open</strong>
                    <span>Select a member from the directory.</span>
                  </div>
                )}
              </section>
              </>
              )}
            </div>
          </section>
        )}

        {showBilling && (
          <section className="settings-page billing-page">
            <div className="settings-heading">
              <div>
                <span className="dashboard-kicker">Billing</span>
                <h1>Billing management</h1>
                <p>Create billing items, run billing cycles, and review member bill balances.</p>
              </div>
              <button
                className="secondary-button"
                onClick={() => (activeBillingTab === 'items' ? loadBillingItems() : loadMemberBills())}
                disabled={billingItemsLoading || memberBillsLoading}
              >
                {billingItemsLoading || memberBillsLoading ? (
                  <Loader2 className="spin" size={17} />
                ) : (
                  <RefreshCw size={17} />
                )}
                Refresh
              </button>
            </div>

            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
            {billingItemsError && <div className="dashboard-alert">{billingItemsError}</div>}
            {memberBillsError && <div className="dashboard-alert">{memberBillsError}</div>}

            <div className="settings-tabs billing-tabs" aria-label="Billing pages">
              <button className={activeBillingTab === 'items' ? 'active' : ''} onClick={() => setActiveBillingTab('items')}>
                Billing items
              </button>
              <button className={activeBillingTab === 'run' ? 'active' : ''} onClick={() => setActiveBillingTab('run')}>
                Run billing
              </button>
              <button className={activeBillingTab === 'bills' ? 'active' : ''} onClick={() => setActiveBillingTab('bills')}>
                Member bills
              </button>
            </div>

            {activeBillingTab === 'items' && (
              <div className="billing-layout">
                <section className="settings-card billing-form-card">
                  <div className="settings-card-heading">
                    <FileText size={21} />
                    <div>
                      <h2>{editingBillingItemId ? 'Edit billing item' : 'Add billing item'}</h2>
                      <p>{editingBillingItemId ? 'Update the selected billing item.' : 'Create charges that can be billed to members.'}</p>
                    </div>
                  </div>

                  <form className="form-stack" onSubmit={handleBillingItemSubmit}>
                    <div className="form-grid two-columns">
                      <label>
                        Name
                        <input
                          value={billingItemForm.name}
                          onChange={(event) => setBillingItemForm({ ...billingItemForm, name: event.target.value })}
                          placeholder="Example: Monthly contribution"
                          required
                        />
                      </label>
                      <label>
                        Amount
                        <input
                          value={billingItemForm.amount}
                          onChange={(event) => setBillingItemForm({ ...billingItemForm, amount: event.target.value })}
                          min="0.01"
                          step="0.01"
                          type="number"
                          required
                        />
                      </label>
                      <label>
                        Currency
                        <input
                          value={billingItemForm.currency}
                          onChange={(event) => setBillingItemForm({ ...billingItemForm, currency: event.target.value })}
                          placeholder="USD"
                          required
                        />
                      </label>
                      <label>
                        Frequency
                        <select
                          value={billingItemForm.frequency}
                          onChange={(event) => setBillingItemForm({ ...billingItemForm, frequency: event.target.value })}
                        >
                          {billingFrequencies.map((frequency) => (
                            <option value={frequency} key={frequency}>
                              {formatMetricLabel(frequency)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Applies to
                        <select
                          value={billingItemForm.appliesTo}
                          onChange={(event) => setBillingItemForm({ ...billingItemForm, appliesTo: event.target.value })}
                        >
                          {billingAppliesTo.map((scope) => (
                            <option value={scope} key={scope}>
                              {formatMetricLabel(scope)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Status
                        <select
                          value={billingItemForm.status}
                          onChange={(event) => setBillingItemForm({ ...billingItemForm, status: event.target.value })}
                        >
                          {billingItemStatuses.map((status) => (
                            <option value={status} key={status}>
                              {formatMetricLabel(status)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Year
                        <input
                          value={billingItemForm.year}
                          onChange={(event) => setBillingItemForm({ ...billingItemForm, year: event.target.value })}
                          min="2000"
                          type="number"
                        />
                      </label>
                      <label>
                        Month
                        <select
                          value={billingItemForm.month}
                          onChange={(event) => setBillingItemForm({ ...billingItemForm, month: event.target.value })}
                        >
                          <option value="">No month</option>
                          {months.map((month) => (
                            <option value={month} key={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label>
                      Description
                      <input
                        value={billingItemForm.description}
                        onChange={(event) => setBillingItemForm({ ...billingItemForm, description: event.target.value })}
                        placeholder="Optional"
                      />
                    </label>

                    <div className="form-actions">
                      <button className="primary-button" disabled={busyAction === 'billing-item-save'}>
                        {busyAction === 'billing-item-save' ? (
                          <Loader2 className="spin" size={18} />
                        ) : editingBillingItemId ? (
                          <Save size={18} />
                        ) : (
                          <Plus size={18} />
                        )}
                        {editingBillingItemId ? 'Save changes' : 'Create item'}
                      </button>
                      {editingBillingItemId && (
                        <button type="button" className="secondary-button" onClick={resetBillingItemForm}>
                          <X size={17} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                <section className="settings-card billing-table-card">
                  <div className="settings-card-heading">
                    <LayoutDashboard size={21} />
                    <div>
                      <h2>Billing item directory</h2>
                      <p>
                        {billingItems.length} {billingItems.length === 1 ? 'billing item' : 'billing items'} configured.
                      </p>
                    </div>
                  </div>

                  {billingItemsLoading ? (
                    <div className="empty-table-state">
                      <Loader2 className="spin" size={22} />
                      <strong>Loading billing items</strong>
                    </div>
                  ) : billingItems.length > 0 ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Amount</th>
                            <th>Frequency</th>
                            <th>Scope</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {billingItems.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <strong>{item.name}</strong>
                                <span className="table-subtext">{item.description || 'No description'}</span>
                              </td>
                              <td>{formatCurrency(item.amount, item.currency)}</td>
                              <td>{formatMetricLabel(item.frequency)}</td>
                              <td>{formatMetricLabel(item.appliesTo)}</td>
                              <td>
                                <span className={`status-pill ${String(item.status || '').toLowerCase()}`}>
                                  {formatMetricLabel(item.status || 'UNKNOWN')}
                                </span>
                              </td>
                              <td>
                                <div className="row-actions">
                                  <button
                                    onClick={() => handleEditBillingItem(item.id)}
                                    disabled={busyAction === 'billing-item-edit'}
                                  >
                                    <Edit3 size={16} />
                                    Edit
                                  </button>
                                  <button
                                    className="danger-button"
                                    onClick={() => handleDeleteBillingItem(item.id)}
                                    disabled={busyAction === 'billing-item-delete'}
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-table-state">
                      <FileText size={22} />
                      <strong>No billing items yet</strong>
                      <span>Create the first item using the form.</span>
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeBillingTab === 'run' && (
              <div className="billing-layout billing-run-layout">
                <section className="settings-card billing-form-card">
                  <div className="settings-card-heading">
                    <RefreshCw size={21} />
                    <div>
                      <h2>Run billing</h2>
                      <p>Generate member bills from an existing billing item.</p>
                    </div>
                  </div>

                  <form className="form-stack" onSubmit={handleRunBilling}>
                    <div className="form-grid two-columns">
                      <label>
                        Billing item
                        <select
                          value={billingRunForm.billingItemId}
                          onChange={(event) => setBillingRunForm({ ...billingRunForm, billingItemId: event.target.value })}
                          required
                        >
                          <option value="">Select an item</option>
                          {billingItems.map((item) => (
                            <option value={item.id} key={item.id}>
                              {item.name} - {formatCurrency(item.amount, item.currency)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Month
                        <select
                          value={billingRunForm.month}
                          onChange={(event) => setBillingRunForm({ ...billingRunForm, month: event.target.value })}
                          required
                        >
                          {months.map((month) => (
                            <option value={month} key={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Year
                        <input
                          value={billingRunForm.year}
                          onChange={(event) => setBillingRunForm({ ...billingRunForm, year: event.target.value })}
                          min="2000"
                          type="number"
                        />
                      </label>
                      <label>
                        Zone
                        <select
                          value={billingRunForm.zoneId}
                          onChange={(event) => setBillingRunForm({ ...billingRunForm, zoneId: event.target.value })}
                        >
                          <option value="">All zones</option>
                          {zones.map((zone) => (
                            <option value={zone.id} key={zone.id}>
                              {zone.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Guild
                        <select
                          value={billingRunForm.guildId}
                          onChange={(event) => setBillingRunForm({ ...billingRunForm, guildId: event.target.value })}
                        >
                          <option value="">No guild filter</option>
                          {guilds.map((guild) => (
                            <option value={guild.id} key={guild.id}>
                              {guild.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Member
                        <select
                          value={billingRunForm.memberId}
                          onChange={(event) => setBillingRunForm({ ...billingRunForm, memberId: event.target.value })}
                        >
                          <option value="">No member filter</option>
                          {members.map((member) => (
                            <option value={member.id} key={member.id}>
                              {fullName(member)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="form-actions">
                      <button className="primary-button" disabled={busyAction === 'billing-run' || billingItems.length === 0}>
                        {busyAction === 'billing-run' ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
                        Run billing
                      </button>
                    </div>
                  </form>
                </section>

                <section className="settings-card billing-table-card">
                  <div className="settings-card-heading">
                    <BarChart3 size={21} />
                    <div>
                      <h2>Run results</h2>
                      <p>
                        {billingRunResults.length}{' '}
                        {billingRunResults.length === 1 ? 'bill' : 'bills'} returned by the latest run.
                      </p>
                    </div>
                  </div>

                  {billingRunResults.length > 0 ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Member</th>
                            <th>Item</th>
                            <th>Period</th>
                            <th>Amount</th>
                            <th>Balance</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {billingRunResults.map((bill) => (
                            <tr key={bill.id}>
                              <td>
                                <strong>{bill.memberName}</strong>
                              </td>
                              <td>{bill.billingItem}</td>
                              <td>
                                {bill.month} {bill.year}
                              </td>
                              <td>{formatCurrency(bill.amount, bill.currency)}</td>
                              <td>{formatCurrency(bill.balance, bill.currency)}</td>
                              <td>
                                <span className={`status-pill ${String(bill.status || '').toLowerCase()}`}>
                                  {formatMetricLabel(bill.status || 'UNKNOWN')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-table-state">
                      <BarChart3 size={22} />
                      <strong>No billing run yet</strong>
                      <span>Run billing to see generated member bills.</span>
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeBillingTab === 'bills' && (
              <div className="billing-bills-stack">
                <section className="metric-grid billing-summary-grid" aria-label="Billing summary">
                  <article className="metric-card">
                    <FileText size={22} />
                    <span>Bills loaded</span>
                    <strong>{memberBills.length}</strong>
                  </article>
                  <article className="metric-card">
                    <BarChart3 size={22} />
                    <span>Total billed</span>
                    <strong>{formatCurrency(totalBilled)}</strong>
                  </article>
                  <article className="metric-card">
                    <RefreshCw size={22} />
                    <span>Outstanding</span>
                    <strong>{formatCurrency(totalOutstanding)}</strong>
                  </article>
                </section>

                <section className="settings-card">
                  <div className="settings-card-heading">
                    <Search size={21} />
                    <div>
                      <h2>Bill filters</h2>
                      <p>Load all bills, outstanding bills, a billing period, or one member's bills.</p>
                    </div>
                  </div>

                  <form className="member-filter-bar billing-filter-bar" onSubmit={handleLoadBills}>
                    <label>
                      View
                      <select
                        value={billFilters.mode}
                        onChange={(event) => setBillFilters({ ...billFilters, mode: event.target.value })}
                      >
                        <option value="all">All bills</option>
                        <option value="outstanding">Outstanding</option>
                        <option value="period">By period</option>
                        <option value="member">By member</option>
                      </select>
                    </label>
                    <label>
                      Year
                      <input
                        value={billFilters.year}
                        onChange={(event) => setBillFilters({ ...billFilters, year: event.target.value })}
                        disabled={billFilters.mode !== 'period'}
                        min="2000"
                        type="number"
                      />
                    </label>
                    <label>
                      Month
                      <select
                        value={billFilters.month}
                        onChange={(event) => setBillFilters({ ...billFilters, month: event.target.value })}
                        disabled={billFilters.mode !== 'period'}
                      >
                        {months.map((month) => (
                          <option value={month} key={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Member
                      <select
                        value={billFilters.memberId}
                        onChange={(event) => setBillFilters({ ...billFilters, memberId: event.target.value })}
                        disabled={billFilters.mode !== 'member'}
                      >
                        <option value="">Select a member</option>
                        {members.map((member) => (
                          <option value={member.id} key={member.id}>
                            {fullName(member)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="secondary-button" disabled={memberBillsLoading}>
                      {memberBillsLoading ? <Loader2 className="spin" size={17} /> : <Search size={17} />}
                      Load bills
                    </button>
                  </form>
                </section>

                <section className="settings-card">
                  <div className="settings-card-heading">
                    <LayoutDashboard size={21} />
                    <div>
                      <h2>Member bills</h2>
                      <p>
                        {memberBills.length} {memberBills.length === 1 ? 'bill' : 'bills'} in the current view.
                      </p>
                    </div>
                  </div>

                  {memberBillsLoading ? (
                    <div className="empty-table-state">
                      <Loader2 className="spin" size={22} />
                      <strong>Loading bills</strong>
                    </div>
                  ) : memberBills.length > 0 ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Member</th>
                            <th>Item</th>
                            <th>Period</th>
                            <th>Due date</th>
                            <th>Amount</th>
                            <th>Paid</th>
                            <th>Balance</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memberBills.map((bill) => (
                            <tr key={bill.id}>
                              <td>
                                <strong>{bill.memberName}</strong>
                                <span className="table-subtext">Member #{bill.memberId}</span>
                              </td>
                              <td>{bill.billingItem}</td>
                              <td>
                                {bill.month} {bill.year}
                              </td>
                              <td>{bill.dueDate || 'N/A'}</td>
                              <td>{formatCurrency(bill.amount, bill.currency)}</td>
                              <td>{formatCurrency(bill.amountPaid, bill.currency)}</td>
                              <td>{formatCurrency(bill.balance, bill.currency)}</td>
                              <td>
                                <span className={`status-pill ${String(bill.status || '').toLowerCase()}`}>
                                  {formatMetricLabel(bill.status || 'UNKNOWN')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-table-state">
                      <FileText size={22} />
                      <strong>No bills found</strong>
                      <span>Run billing or change the bill filters.</span>
                    </div>
                  )}
                </section>
              </div>
            )}
          </section>
        )}

        {showPayments && (
          <section className="settings-page payments-page">
            <div className="settings-heading">
              <div>
                <span className="dashboard-kicker">Payments</span>
                <h1>Payment management</h1>
                <p>Capture member payments, allocate them to outstanding bills, and manage receipts.</p>
              </div>
              <button
                className="secondary-button"
                onClick={() => loadPayments()}
                disabled={paymentsLoading}
              >
                {paymentsLoading ? <Loader2 className="spin" size={17} /> : <RefreshCw size={17} />}
                Refresh
              </button>
            </div>

            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
            {paymentsError && <div className="dashboard-alert">{paymentsError}</div>}

            <div className="settings-tabs payment-tabs" aria-label="Payment pages">
              <button className={activePaymentTab === 'capture' ? 'active' : ''} onClick={() => setActivePaymentTab('capture')}>
                Capture payment
              </button>
              <button className={activePaymentTab === 'history' ? 'active' : ''} onClick={() => setActivePaymentTab('history')}>
                Payment history
              </button>
            </div>

            {activePaymentTab === 'capture' && (
              <div className="payment-capture-layout">
                <section className="settings-card">
                  <div className="settings-card-heading">
                    <CreditCard size={21} />
                    <div>
                      <h2>Capture member payment</h2>
                      <p>Select a member, then allocate the payment to that member's outstanding bills.</p>
                    </div>
                  </div>

                  {paymentForm.memberId && (
                    <div className="member-balance-strip">
                      <span>Current balance<strong>{formatCurrency(paymentBillBalance, paymentBalanceCurrency)}</strong></span>
                      <span>Selected allocation<strong>{formatCurrency(paymentAllocationTotal, paymentBalanceCurrency)}</strong></span>
                    </div>
                  )}

                  <form className="form-stack" onSubmit={handlePaymentSubmit}>
                    <div className="form-grid two-columns">
                      <label>
                        Member
                        <select
                          value={paymentForm.memberId}
                          onChange={(event) => handlePaymentMemberChange(event.target.value)}
                          required
                        >
                          <option value="">Select a member</option>
                          {members.map((member) => (
                            <option value={member.id} key={member.id}>
                              {fullName(member)} {member.membershipNo ? `(${member.membershipNo})` : ''}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Payment date
                        <input
                          value={paymentForm.paymentDate}
                          onChange={(event) => setPaymentForm({ ...paymentForm, paymentDate: event.target.value })}
                          type="date"
                          required
                        />
                      </label>
                      <label>
                        Method
                        <select
                          value={paymentForm.paymentMethod}
                          onChange={(event) => setPaymentForm({ ...paymentForm, paymentMethod: event.target.value })}
                        >
                          {paymentMethods.map((method) => (
                            <option value={method} key={method}>
                              {formatMetricLabel(method)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Currency
                        <input
                          value={paymentForm.currency}
                          onChange={(event) => setPaymentForm({ ...paymentForm, currency: event.target.value })}
                          placeholder="USD"
                          required
                        />
                      </label>
                      <label>
                        Reference
                        <input
                          value={paymentForm.paymentReference}
                          onChange={(event) => setPaymentForm({ ...paymentForm, paymentReference: event.target.value })}
                          placeholder="Optional"
                        />
                      </label>
                      <label>
                        Allocation total
                        <input value={paymentAllocationTotal.toFixed(2)} readOnly />
                      </label>
                    </div>
                    <label>
                      Notes
                      <input
                        value={paymentForm.notes}
                        onChange={(event) => setPaymentForm({ ...paymentForm, notes: event.target.value })}
                        placeholder="Optional"
                      />
                    </label>

                    <div className="form-actions">
                      <button
                        className="primary-button"
                        disabled={busyAction === 'payment-save' || paymentAllocationTotal <= 0 || paymentBills.length === 0}
                      >
                        {busyAction === 'payment-save' ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
                        Capture payment
                      </button>
                      <button type="button" className="secondary-button" onClick={resetPaymentForm}>
                        <X size={17} />
                        Clear
                      </button>
                    </div>
                  </form>
                </section>

                <section className="settings-card">
                  <div className="settings-card-heading">
                    <FileText size={21} />
                    <div>
                      <h2>Outstanding bills</h2>
                      <p>
                        {paymentBills.length} {paymentBills.length === 1 ? 'bill' : 'bills'} available for allocation.
                      </p>
                    </div>
                  </div>

                  {paymentBillsLoading ? (
                    <div className="empty-table-state">
                      <Loader2 className="spin" size={22} />
                      <strong>Loading outstanding bills</strong>
                    </div>
                  ) : paymentForm.memberId && paymentBills.length > 0 ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Bill</th>
                            <th>Period</th>
                            <th>Balance</th>
                            <th>Allocate</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentBills.map((bill) => (
                            <tr key={bill.id}>
                              <td>
                                <strong>{bill.billingItem}</strong>
                                <span className="table-subtext">{formatMetricLabel(bill.status)}</span>
                              </td>
                              <td>
                                {bill.month} {bill.year}
                              </td>
                              <td>{formatCurrency(bill.balance, bill.currency)}</td>
                              <td>
                                <input
                                  value={paymentAllocations[bill.id] ?? ''}
                                  onChange={(event) => setAllocationAmount(bill.id, event.target.value)}
                                  max={bill.balance}
                                  min="0"
                                  step="0.01"
                                  type="number"
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <div className="row-actions">
                                  <button type="button" onClick={() => setAllocationAmount(bill.id, bill.balance)}>
                                    Full
                                  </button>
                                  <button type="button" onClick={() => setAllocationAmount(bill.id, '')}>
                                    Clear
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-table-state">
                      <FileText size={22} />
                      <strong>{paymentForm.memberId ? 'No unpaid bills' : 'Select a member'}</strong>
                      <span>{paymentForm.memberId ? 'This member has no bill balances to allocate.' : 'Outstanding bills will appear here.'}</span>
                    </div>
                  )}
                </section>

                {selectedPayment && (
                  <section className="settings-card payment-receipt-card">
                    <div className="settings-card-heading">
                      <FileText size={21} />
                      <div>
                        <h2>Latest receipt</h2>
                        <p>{selectedPayment.receiptNo}</p>
                      </div>
                    </div>
                    <div className="detail-grid">
                      <span>Member<strong>{selectedPayment.memberName}</strong></span>
                      <span>Amount<strong>{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</strong></span>
                      <span>Method<strong>{formatMetricLabel(selectedPayment.paymentMethod)}</strong></span>
                      <span>Status<strong>{selectedPayment.reversed ? 'Reversed' : 'Valid'}</strong></span>
                    </div>
                    <div className="form-actions receipt-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleDownloadPaymentReceipt(selectedPayment, paymentBillBalance)}
                      >
                        <Download size={17} />
                        Download PDF
                      </button>
                    </div>
                  </section>
                )}
              </div>
            )}

            {activePaymentTab === 'history' && (
              <div className="billing-bills-stack">
                <section className="metric-grid billing-summary-grid" aria-label="Payment summary">
                  <article className="metric-card">
                    <CreditCard size={22} />
                    <span>Payments loaded</span>
                    <strong>{payments.length}</strong>
                  </article>
                  <article className="metric-card">
                    <BarChart3 size={22} />
                    <span>Valid total</span>
                    <strong>{formatCurrency(totalPayments)}</strong>
                  </article>
                  <article className="metric-card">
                    <FileText size={22} />
                    <span>Selected receipt</span>
                    <strong>{selectedPayment?.receiptNo || 'N/A'}</strong>
                  </article>
                </section>

                <section className="settings-card">
                  <div className="settings-card-heading">
                    <Search size={21} />
                    <div>
                      <h2>Payment lookup</h2>
                      <p>Load all payments, payments for a member, or a single receipt.</p>
                    </div>
                  </div>

                  <form className="member-filter-bar payment-filter-bar" onSubmit={handleLoadPayments}>
                    <label>
                      View
                      <select
                        value={paymentLookup.mode}
                        onChange={(event) => setPaymentLookup({ ...paymentLookup, mode: event.target.value })}
                      >
                        <option value="all">All payments</option>
                        <option value="member">By member</option>
                        <option value="receipt">By receipt</option>
                      </select>
                    </label>
                    <label>
                      Member
                      <select
                        value={paymentLookup.memberId}
                        onChange={(event) => setPaymentLookup({ ...paymentLookup, memberId: event.target.value })}
                        disabled={paymentLookup.mode !== 'member'}
                      >
                        <option value="">Select a member</option>
                        {members.map((member) => (
                          <option value={member.id} key={member.id}>
                            {fullName(member)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Receipt no
                      <input
                        value={paymentLookup.receiptNo}
                        onChange={(event) => setPaymentLookup({ ...paymentLookup, receiptNo: event.target.value })}
                        disabled={paymentLookup.mode !== 'receipt'}
                        placeholder="RCP-YYYYMMDD-000001"
                      />
                    </label>
                    <button className="secondary-button" disabled={paymentsLoading}>
                      {paymentsLoading ? <Loader2 className="spin" size={17} /> : <Search size={17} />}
                      Load payments
                    </button>
                  </form>
                </section>

                <section className="settings-card">
                  <div className="settings-card-heading">
                    <LayoutDashboard size={21} />
                    <div>
                      <h2>Payment history</h2>
                      <p>
                        {payments.length} {payments.length === 1 ? 'payment' : 'payments'} in the current view.
                      </p>
                    </div>
                  </div>

                  {paymentsLoading ? (
                    <div className="empty-table-state">
                      <Loader2 className="spin" size={22} />
                      <strong>Loading payments</strong>
                    </div>
                  ) : payments.length > 0 ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Receipt</th>
                            <th>Member</th>
                            <th>Date</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr className={selectedPayment?.id === payment.id ? 'selected-row' : ''} key={payment.id}>
                              <td>
                                <strong>{payment.receiptNo}</strong>
                                <span className="table-subtext">{payment.paymentReference || 'No reference'}</span>
                              </td>
                              <td>{payment.memberName}</td>
                              <td>{payment.paymentDate}</td>
                              <td>{formatMetricLabel(payment.paymentMethod)}</td>
                              <td>{formatCurrency(payment.amount, payment.currency)}</td>
                              <td>
                                <span className={`status-pill ${payment.reversed ? 'cancelled' : 'paid'}`}>
                                  {payment.reversed ? 'Reversed' : 'Valid'}
                                </span>
                              </td>
                              <td>
                                <div className="row-actions">
                                  <button onClick={() => handleOpenPayment(payment.id)} disabled={busyAction === 'payment-open'}>
                                    <UserCheck size={16} />
                                    Open
                                  </button>
                                  <button type="button" onClick={() => handleDownloadPaymentReceipt(payment)}>
                                    <Download size={16} />
                                    PDF
                                  </button>
                                  {!payment.reversed && (
                                    <button
                                      className="danger-button"
                                      onClick={() => handleReversePayment(payment.id)}
                                      disabled={busyAction === 'payment-reverse'}
                                    >
                                      <RefreshCw size={16} />
                                      Reverse
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-table-state">
                      <CreditCard size={22} />
                      <strong>No payments found</strong>
                      <span>Capture a payment or change the lookup filters.</span>
                    </div>
                  )}
                </section>

                {selectedPayment && (
                  <section className="settings-card">
                    <div className="settings-card-heading">
                      <FileText size={21} />
                      <div>
                        <h2>Receipt detail</h2>
                        <p>{selectedPayment.receiptNo}</p>
                      </div>
                    </div>
                    <div className="detail-grid">
                      <span>Member<strong>{selectedPayment.memberName}</strong></span>
                      <span>Amount<strong>{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</strong></span>
                      <span>Received by<strong>{selectedPayment.receivedByUserId || 'N/A'}</strong></span>
                      <span>Status<strong>{selectedPayment.reversed ? 'Reversed' : 'Valid'}</strong></span>
                    </div>
                    <div className="form-actions receipt-actions">
                      <button type="button" className="secondary-button" onClick={() => handleDownloadPaymentReceipt(selectedPayment)}>
                        <Download size={17} />
                        Download PDF
                      </button>
                    </div>
                    <div className="mini-table-grid">
                      <div>
                        <h4>Allocations</h4>
                        {(selectedPayment.allocations ?? []).map((allocation) => (
                          <span className="mini-row" key={allocation.id}>
                            Bill #{allocation.memberBillId}
                            <strong>{formatCurrency(allocation.amountAllocated, selectedPayment.currency)}</strong>
                          </span>
                        ))}
                        {(selectedPayment.allocations ?? []).length === 0 && <span className="muted-text">No allocations</span>}
                      </div>
                      <div>
                        <h4>Notes</h4>
                        <span className="muted-text">{selectedPayment.notes || 'No notes captured'}</span>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}
          </section>
        )}

        {showReports && (
          <section className="settings-page reports-page">
            <div className="settings-heading">
              <div>
                <span className="dashboard-kicker">Reports</span>
                <h1>Reporting centre</h1>
                <p>Run controller-backed parish reports, review totals, and export polished PDFs.</p>
              </div>
              <button
                className="secondary-button"
                onClick={handleDownloadReportPdf}
                disabled={busyAction === 'report-pdf' || reportsLoading}
              >
                {busyAction === 'report-pdf' ? <Loader2 className="spin" size={17} /> : <Download size={17} />}
                Download PDF
              </button>
            </div>

            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
            {reportsError && <div className="dashboard-alert">{reportsError}</div>}

            <div className="reports-layout">
              <section className="settings-card report-picker-card">
                <div className="settings-card-heading">
                  <BarChart3 size={21} />
                  <div>
                    <h2>Report type</h2>
                    <p>{activeReportTab.description}</p>
                  </div>
                </div>

                <div className="report-tab-list" aria-label="Available reports">
                  {reportTabs.map((tab) => (
                    <button
                      className={activeReportKey === tab.key ? 'active' : ''}
                      key={tab.key}
                      onClick={() => {
                        setActiveReportKey(tab.key);
                        setReportResult(null);
                        setReportsError('');
                      }}
                      type="button"
                    >
                      <strong>{tab.label}</strong>
                      <span>{tab.description}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="settings-card report-filter-card">
                <div className="settings-card-heading">
                  <Search size={21} />
                  <div>
                    <h2>{activeReportTab.label}</h2>
                    <p>Choose filters and run the report before exporting.</p>
                  </div>
                </div>

                <form className="report-filter-grid" onSubmit={handleRunReport}>
                  {activeReportKey === 'dailyCollections' && (
                    <label>
                      Date
                      <input
                        type="date"
                        value={reportFilters.date}
                        onChange={(event) => setReportFilters({ ...reportFilters, date: event.target.value })}
                      />
                    </label>
                  )}

                  {['monthlyCollections', 'yearlyCollections'].includes(activeReportKey) && (
                    <label>
                      Year
                      <input
                        type="number"
                        min="2000"
                        value={reportFilters.year}
                        onChange={(event) => setReportFilters({ ...reportFilters, year: event.target.value })}
                      />
                    </label>
                  )}

                  {activeReportKey === 'monthlyCollections' && (
                    <label>
                      Month
                      <select
                        value={reportFilters.month}
                        onChange={(event) => setReportFilters({ ...reportFilters, month: event.target.value })}
                      >
                        {months.map((month, index) => (
                          <option value={index + 1} key={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {['paymentMethodSummary', 'cashierSummary'].includes(activeReportKey) && (
                    <>
                      <label>
                        From
                        <input
                          type="date"
                          value={reportFilters.fromDate}
                          onChange={(event) => setReportFilters({ ...reportFilters, fromDate: event.target.value })}
                        />
                      </label>
                      <label>
                        To
                        <input
                          type="date"
                          value={reportFilters.toDate}
                          onChange={(event) => setReportFilters({ ...reportFilters, toDate: event.target.value })}
                        />
                      </label>
                    </>
                  )}

                  {activeReportKey === 'outstandingByZone' && (
                    <label>
                      Zone
                      <select
                        value={reportFilters.zoneId}
                        onChange={(event) => setReportFilters({ ...reportFilters, zoneId: event.target.value })}
                      >
                        <option value="">Select a zone</option>
                        {zones.map((zone) => (
                          <option value={zone.id} key={zone.id}>
                            {zone.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {['outstandingBalances', 'membersByZone'].includes(activeReportKey) && (
                    <div className="report-static-note">
                      <FileText size={18} />
                      <span>This report uses the current backend data and does not need filters.</span>
                    </div>
                  )}

                  <div className="form-actions report-actions">
                    <button className="primary-button" disabled={reportsLoading || busyAction === 'report-run'}>
                      {reportsLoading || busyAction === 'report-run' ? <Loader2 className="spin" size={18} /> : <Search size={18} />}
                      Run report
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleDownloadReportPdf}
                      disabled={busyAction === 'report-pdf' || reportsLoading}
                    >
                      {busyAction === 'report-pdf' ? <Loader2 className="spin" size={17} /> : <Download size={17} />}
                      PDF
                    </button>
                  </div>
                </form>
              </section>
            </div>

            <section className="settings-card report-preview-card">
              <div className="settings-card-heading">
                <LayoutDashboard size={21} />
                <div>
                  <h2>{reportResult?.title || 'Report preview'}</h2>
                  <p>{reportResult?.subtitle || 'Run a report to preview data here.'}</p>
                </div>
              </div>

              {reportsLoading ? (
                <div className="empty-table-state">
                  <Loader2 className="spin" size={22} />
                  <strong>Loading report</strong>
                </div>
              ) : reportResult ? (
                <div className="report-preview-stack">
                  {reportEntries.length > 0 && (
                    <section className="report-card-grid">
                      {reportEntries.map(([key, value]) => (
                        <article className="report-summary-card" key={key}>
                          <span>{reportLabel(key)}</span>
                          <strong>{formatReportValue(value)}</strong>
                        </article>
                      ))}
                    </section>
                  )}

                  {reportRows.length > 0 && (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            {reportColumns.map((column) => (
                              <th key={column}>{reportLabel(column)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reportRows.map((row, index) => (
                            <tr key={`${reportResult.key}-${index}`}>
                              {reportColumns.map((column) => (
                                <td key={column}>{formatReportValue(row?.[column])}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {reportRows.length === 0 && reportEntries.length === 0 && (
                    <div className="empty-table-state">
                      <FileText size={22} />
                      <strong>No report rows</strong>
                      <span>The backend returned an empty result for these filters.</span>
                    </div>
                  )}

                  <div className="report-export-note">
                    <Download size={17} />
                    <span>This preview is ready for PDF export.</span>
                  </div>
                </div>
              ) : (
                <div className="empty-table-state">
                  <BarChart3 size={22} />
                  <strong>No report loaded</strong>
                  <span>Select a report and run it.</span>
                </div>
              )}
            </section>
          </section>
        )}

        {showSettings && (
          <section className="settings-page">
            <div className="settings-heading">
              <div>
                <span className="dashboard-kicker">Settings</span>
                <h1>{activeSettingTab === 'zones' ? 'Zones' : activeResourceConfig.title}</h1>
                <p>
                  {activeSettingTab === 'zones'
                    ? 'Manage parish zones and their leader contact details.'
                    : activeResourceConfig.description}
                </p>
              </div>
              <button
                className="secondary-button"
                onClick={() => (activeSettingTab === 'zones' ? loadZones() : loadResource(activeSettingTab))}
                disabled={activeSettingTab === 'zones' ? zonesLoading : resourceLoading[activeSettingTab]}
              >
                {(activeSettingTab === 'zones' ? zonesLoading : resourceLoading[activeSettingTab]) ? (
                  <Loader2 className="spin" size={17} />
                ) : (
                  <RefreshCw size={17} />
                )}
                Refresh
              </button>
            </div>

            <div className="settings-tabs" aria-label="Settings areas">
              {settingTabs.map((tab) => (
                <button
                  className={activeSettingTab === tab.key ? 'active' : ''}
                  key={tab.key}
                  onClick={() => setActiveSettingTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
            {activeSettingTab === 'zones' && zonesError && <div className="dashboard-alert">{zonesError}</div>}
            {activeSettingTab !== 'zones' && resourceErrors[activeSettingTab] && (
              <div className="dashboard-alert">{resourceErrors[activeSettingTab]}</div>
            )}

            {activeSettingTab === 'zones' ? (
              <div className="settings-grid">
                <section className="settings-card">
                  <div className="settings-card-heading">
                    <MapPinned size={21} />
                    <div>
                      <h2>{editingZoneId ? 'Edit zone' : 'Add zone'}</h2>
                      <p>{editingZoneId ? 'Update the selected zone details.' : 'Create a new parish zone.'}</p>
                    </div>
                  </div>

                  <form className="form-stack" onSubmit={handleZoneSubmit}>
                    <label>
                      Zone name
                      <input
                        value={zoneForm.name}
                        onChange={(event) => setZoneForm({ ...zoneForm, name: event.target.value })}
                        placeholder="Example: St. Mary Zone"
                        required
                      />
                    </label>
                    <label>
                      Leader name
                      <input
                        value={zoneForm.leaderName}
                        onChange={(event) => setZoneForm({ ...zoneForm, leaderName: event.target.value })}
                        placeholder="Optional"
                      />
                    </label>
                    <label>
                      Leader phone
                      <input
                        value={zoneForm.leaderPhone}
                        onChange={(event) => setZoneForm({ ...zoneForm, leaderPhone: event.target.value })}
                        placeholder="Optional"
                      />
                    </label>

                    <div className="form-actions">
                      <button className="primary-button" disabled={busyAction === 'zone-save'}>
                        {busyAction === 'zone-save' ? (
                          <Loader2 className="spin" size={18} />
                        ) : editingZoneId ? (
                          <Save size={18} />
                        ) : (
                          <Plus size={18} />
                        )}
                        {editingZoneId ? 'Save changes' : 'Create zone'}
                      </button>
                      {editingZoneId && (
                        <button type="button" className="secondary-button" onClick={resetZoneForm}>
                          <X size={17} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                <section className="settings-card zones-card">
                  <div className="settings-card-heading">
                    <LayoutDashboard size={21} />
                    <div>
                      <h2>Zone directory</h2>
                      <p>
                        {zones.length} {zones.length === 1 ? 'zone' : 'zones'} configured.
                      </p>
                    </div>
                  </div>

                  {zonesLoading ? (
                    <div className="empty-table-state">
                      <Loader2 className="spin" size={22} />
                      <strong>Loading zones</strong>
                    </div>
                  ) : zones.length > 0 ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Zone</th>
                            <th>Leader</th>
                            <th>Phone</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {zones.map((zone) => (
                            <tr key={zone.id}>
                              <td>
                                <strong>{zone.name}</strong>
                              </td>
                              <td>{zone.leaderName || 'N/A'}</td>
                              <td>{zone.leaderPhone || 'N/A'}</td>
                              <td>
                                <div className="row-actions">
                                  <button onClick={() => handleEditZone(zone.id)} disabled={busyAction === 'zone-edit'}>
                                    <Edit3 size={16} />
                                    Edit
                                  </button>
                                  <button
                                    className="danger-button"
                                    onClick={() => handleDeleteZone(zone.id)}
                                    disabled={busyAction === 'zone-delete'}
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-table-state">
                      <MapPinned size={22} />
                      <strong>No zones yet</strong>
                      <span>Create the first zone using the form.</span>
                    </div>
                  )}
                </section>
              </div>
            ) : (
              <div className="settings-grid">
                <section className="settings-card">
                  <div className="settings-card-heading">
                    <MapPinned size={21} />
                    <div>
                      <h2>
                        {activeResourceEditingId
                          ? `Edit ${activeResourceConfig.singular}`
                          : `Add ${activeResourceConfig.singular}`}
                      </h2>
                      <p>
                        {activeResourceEditingId
                          ? `Update the selected ${activeResourceConfig.singular}.`
                          : `Create a new ${activeResourceConfig.singular}.`}
                      </p>
                    </div>
                  </div>

                  <form className="form-stack" onSubmit={(event) => handleResourceSubmit(event, activeSettingTab)}>
                    {activeResourceConfig.fields.map((field) => (
                      <label key={field.name}>
                        {field.label}
                        {field.type === 'zone-select' ? (
                          <select
                            value={activeResourceForm[field.name] ?? ''}
                            onChange={(event) =>
                              setResourceForms((current) => ({
                                ...current,
                                [activeSettingTab]: { ...current[activeSettingTab], [field.name]: event.target.value },
                              }))
                            }
                            required={field.required}
                            disabled={zonesLoading || zones.length === 0}
                          >
                            <option value="">
                              {zonesLoading ? 'Loading zones' : zones.length === 0 ? 'Create a zone first' : 'Select a zone'}
                            </option>
                            {zones.map((zone) => (
                              <option value={zone.id} key={zone.id}>
                                {zone.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={activeResourceForm[field.name] ?? ''}
                            onChange={(event) =>
                              setResourceForms((current) => ({
                                ...current,
                                [activeSettingTab]: { ...current[activeSettingTab], [field.name]: event.target.value },
                              }))
                            }
                            placeholder={field.placeholder}
                            required={field.required}
                          />
                        )}
                      </label>
                    ))}

                    <div className="form-actions">
                      <button
                        className="primary-button"
                        disabled={
                          busyAction === `${activeSettingTab}-save` ||
                          (activeSettingTab === 'sections' && (zonesLoading || zones.length === 0))
                        }
                      >
                        {busyAction === `${activeSettingTab}-save` ? (
                          <Loader2 className="spin" size={18} />
                        ) : activeResourceEditingId ? (
                          <Save size={18} />
                        ) : (
                          <Plus size={18} />
                        )}
                        {activeResourceEditingId ? 'Save changes' : `Create ${activeResourceConfig.singular}`}
                      </button>
                      {activeResourceEditingId && (
                        <button type="button" className="secondary-button" onClick={() => resetResourceForm(activeSettingTab)}>
                          <X size={17} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                <section className="settings-card">
                  <div className="settings-card-heading">
                    <LayoutDashboard size={21} />
                    <div>
                      <h2>{activeResourceConfig.directory}</h2>
                      <p>
                        {activeResourceRows.length}{' '}
                        {activeResourceRows.length === 1
                          ? activeResourceConfig.singular
                          : activeResourceConfig.title.toLowerCase()}{' '}
                        configured.
                      </p>
                    </div>
                  </div>

                  {resourceLoading[activeSettingTab] ? (
                    <div className="empty-table-state">
                      <Loader2 className="spin" size={22} />
                      <strong>Loading {activeResourceConfig.title.toLowerCase()}</strong>
                    </div>
                  ) : activeResourceRows.length > 0 ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            {activeResourceConfig.columns.map((column) => (
                              <th key={column.key}>{column.label}</th>
                            ))}
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeResourceRows.map((item) => (
                            <tr key={item.id}>
                              {activeResourceConfig.columns.map((column, index) => (
                                <td key={column.key}>
                                  {index === 0 ? <strong>{item[column.key] || 'N/A'}</strong> : item[column.key] || 'N/A'}
                                </td>
                              ))}
                              <td>
                                <div className="row-actions">
                                  <button
                                    onClick={() => handleEditResource(activeSettingTab, item.id)}
                                    disabled={busyAction === `${activeSettingTab}-edit`}
                                  >
                                    <Edit3 size={16} />
                                    Edit
                                  </button>
                                  <button
                                    className="danger-button"
                                    onClick={() => handleDeleteResource(activeSettingTab, item.id)}
                                    disabled={busyAction === `${activeSettingTab}-delete`}
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-table-state">
                      <MapPinned size={22} />
                      <strong>No {activeResourceConfig.title.toLowerCase()} yet</strong>
                      <span>Create the first {activeResourceConfig.singular} using the form.</span>
                    </div>
                  )}
                </section>
              </div>
            )}
          </section>
        )}
      </main>
    );
  }

  return (
    <main className="shell">
      <nav className="topbar" aria-label="Application header">
        <div className="brand-mark">
          <Building2 size={20} />
        </div>
        <div>
          <strong>Our Lady of Wisdom</strong>
          <span>Parish membership system</span>
        </div>
      </nav>

      <section className="app-layout">
        <aside className="welcome-panel">
          <div className="welcome-copy">
            <span className="eyebrow">Secure parish operations</span>
            <h1>Welcome back</h1>
          </div>
        </aside>

        <section className="access-panel">
          <section className="auth-card">
            <div className="card-heading">
              <div>
                <h2>{activeTab === 'login' ? 'Sign in to your account' : 'Create a new user'}</h2>
                <p>
                  {activeTab === 'login'
                    ? 'Use your parish system credentials to continue.'
                    : 'Add a staff, leader, cashier, or member account.'}
                </p>
              </div>
            </div>

            <div className="tabs" aria-label="Authentication actions">
              <button className={activeTab === 'login' ? 'active' : ''} onClick={() => setActiveTab('login')}>
                <LogIn size={17} />
                Sign in
              </button>
              <button className={activeTab === 'register' ? 'active' : ''} onClick={() => setActiveTab('register')}>
                <UserPlus size={17} />
                New user
              </button>
            </div>

            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

            {activeTab === 'login' ? (
              <form className="form-stack" onSubmit={handleLogin}>
                <label>
                  Username
                  <input
                    value={loginForm.username}
                    onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })}
                    placeholder="Enter your username"
                    autoComplete="username"
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    value={loginForm.password}
                    onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                    placeholder="Enter your password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <button className="primary-button" disabled={busyAction === 'login'}>
                  {busyAction === 'login' ? <Loader2 className="spin" size={18} /> : <LockKeyhole size={18} />}
                  Sign in
                </button>
              </form>
            ) : (
              <form className="form-stack" onSubmit={handleRegister}>
                <label>
                  Username
                  <input
                    value={registerForm.username}
                    onChange={(event) => setRegisterForm({ ...registerForm, username: event.target.value })}
                    placeholder="Choose a username"
                    autoComplete="username"
                    required
                  />
                </label>
                <label>
                  Temporary password
                  <input
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                    placeholder="Minimum 8 characters"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>
                <label>
                  Confirm password
                  <input
                    value={registerForm.confirmPassword}
                    onChange={(event) => setRegisterForm({ ...registerForm, confirmPassword: event.target.value })}
                    placeholder="Re-enter your password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>
                <button className="primary-button" disabled={busyAction === 'register'}>
                  {busyAction === 'register' ? <Loader2 className="spin" size={18} /> : <UserPlus size={18} />}
                  Create account
                </button>
              </form>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
