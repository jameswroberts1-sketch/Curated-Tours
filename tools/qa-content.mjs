import fs from 'node:fs';
import path from 'node:path';

const filePath = process.argv[2] || 'Collections.json';
const fullPath = path.resolve(filePath);
const rootDir = path.dirname(fullPath);
const raw = fs.readFileSync(fullPath, 'utf8');
const records = JSON.parse(raw);
const recordedAudioById = {
  37: 'audio/id37_henley_bridge.mp3',
  38: 'audio/id38_the_angel.mp3',
  39: 'audio/id39_st_marys_church.mp3',
};

const issues = [];
const warnings = [];
const ids = new Map();

const wordCount = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length;
const isFiniteNumber = (value) => Number.isFinite(Number.parseFloat(value));

records.forEach((record, index) => {
  const label = `record ${index + 1}${record.title ? ` (${record.title})` : ''}`;
  const id = String(record.id ?? '').trim();

  if (!id) issues.push(`${label}: missing id`);
  else if (ids.has(id)) issues.push(`${label}: duplicate id ${id}`);
  else ids.set(id, index);

  if (!String(record.title || '').trim()) issues.push(`${label}: missing title`);
  if (!String(record.area || '').trim()) issues.push(`${label}: missing area/city`);
  if (!String(record.lead_subject_primary_role || '').trim()) issues.push(`${label}: missing collection`);
  if (!String(record.inscription || '').trim()) warnings.push(`${label}: missing short summary/inscription`);
  if (!String(record.lead_subject_bio || '').trim()) warnings.push(`${label}: missing long audio bio`);
  const audioFile = String(record.audio_file || recordedAudioById[record.id] || '').trim();
  if (audioFile) {
    const audioPath = path.resolve(rootDir, audioFile);
    if (!fs.existsSync(audioPath)) warnings.push(`${label}: audio file not found at ${audioFile}`);
  }

  if (!isFiniteNumber(record.latitude) || !isFiniteNumber(record.longitude)) {
    issues.push(`${label}: invalid latitude/longitude`);
  }

  const bioWords = wordCount(record.lead_subject_bio);
  if (bioWords > 0 && bioWords < 250) warnings.push(`${label}: long audio bio is short (${bioWords} words)`);
  if (bioWords > 1800) warnings.push(`${label}: long audio bio is very long (${bioWords} words)`);
});

const areas = [...new Set(records.map((record) => record.area).filter(Boolean))].sort();
const collections = [...new Set(records.map((record) => record.lead_subject_primary_role).filter(Boolean))].sort();

console.log(`Checked ${records.length} records in ${path.basename(fullPath)}`);
console.log(`Cities: ${areas.join(', ') || 'none'}`);
console.log(`Collections: ${collections.length}`);
console.log(`Issues: ${issues.length}`);
issues.forEach((issue) => console.log(`ERROR: ${issue}`));
console.log(`Warnings: ${warnings.length}`);
warnings.forEach((warning) => console.log(`WARN: ${warning}`));

if (issues.length) process.exitCode = 1;
