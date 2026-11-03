import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as XLSX from 'xlsx';
import { INITIAL_COMPANIES } from '../src/data/initialData';
import { createCompaniesWorkbook } from '../src/services/excelService';

test('company export opens on the company names sheet before the summary sheet', () => {
  const workbook = createCompaniesWorkbook(INITIAL_COMPANIES.slice(0, 2));
  assert.equal(workbook.SheetNames[0], 'Kurumsal Portföy');
  assert.equal(workbook.SheetNames[1], 'Rapor Özeti');

  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(workbook.Sheets[workbook.SheetNames[0]]);
  assert.deepEqual(rows.map(row => row['Firma Adı']), INITIAL_COMPANIES.slice(0, 2).map(company => company.name));
  assert.equal(workbook.Sheets[workbook.SheetNames[0]]['!autofilter']?.ref, 'A1:T3');
});
