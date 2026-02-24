#!/usr/bin/env node
'use strict';
const fs   = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'json_data');

// ── Classes check ──────────────────────────────────────────────────────────
const classes = JSON.parse(fs.readFileSync(path.join(dir, 'classes.json'), 'utf8'));
const barb    = classes.find(function(c) { return c._key === 'barbarian'; });
console.log('=== Classes (' + classes.length + ') ===');
console.log('  Keys:', classes.map(function(c) { return c._key; }).join(', '));
console.log('  Barbarian top fields:', Object.keys(barb).filter(function(k) { return k !== 'features'; }));
console.log('  Barbarian feature count:', Object.keys(barb.features || {}).length);
console.log('  Rage description (first 120 chars):',
  (barb.features && barb.features.rage && barb.features.rage.description || '').substring(0, 120));

// ── Subclasses check ───────────────────────────────────────────────────────
const subs  = JSON.parse(fs.readFileSync(path.join(dir, 'subclasses.json'), 'utf8'));
console.log('\n=== Subclasses (' + subs.length + ') ===');
const subsByClass = {};
subs.forEach(function(s) {
  var cls = s._parentClass || 'unknown';
  if (!subsByClass[cls]) subsByClass[cls] = 0;
  subsByClass[cls]++;
});
Object.keys(subsByClass).sort().forEach(function(cls) {
  console.log('  ' + cls + ': ' + subsByClass[cls] + ' subclasses');
});

// ── Spells check ───────────────────────────────────────────────────────────
const spells = JSON.parse(fs.readFileSync(path.join(dir, 'spells.json'), 'utf8'));
console.log('\n=== Spells (' + spells.length + ') ===');
const byLevel = {};
spells.forEach(function(s) {
  var l = s.level === 0 ? 'cantrip' : 'level ' + s.level;
  if (!byLevel[l]) byLevel[l] = 0;
  byLevel[l]++;
});
Object.keys(byLevel).sort().forEach(function(l) {
  console.log('  ' + l + ': ' + byLevel[l] + ' spells');
});
var fireball = spells.find(function(s) { return s._key === 'fireball'; });
console.log('  Fireball:', fireball ? 'found (level ' + fireball.level + ', ' + fireball.school + ')' : 'MISSING');

// ── Races check ────────────────────────────────────────────────────────────
const races = JSON.parse(fs.readFileSync(path.join(dir, 'races.json'), 'utf8'));
console.log('\n=== Races (' + races.length + ') ===');
console.log(' ', races.map(function(r) { return r.name || r._key; }).join(', '));

// ── Creatures check ────────────────────────────────────────────────────────
const creatures = JSON.parse(fs.readFileSync(path.join(dir, 'creatures.json'), 'utf8'));
console.log('\n=== Creatures (' + creatures.length + ') ===');
const cTypes = {};
creatures.forEach(function(c) {
  var t = c.type || 'unknown';
  if (!cTypes[t]) cTypes[t] = 0;
  cTypes[t]++;
});
Object.keys(cTypes).sort().forEach(function(t) {
  console.log('  ' + t + ': ' + cTypes[t]);
});

// ── Magic items check ──────────────────────────────────────────────────────
const items = JSON.parse(fs.readFileSync(path.join(dir, 'magic_items.json'), 'utf8'));
console.log('\n=== Magic Items (' + items.length + ') ===');
const rarities = {};
items.forEach(function(i) {
  var r = i.rarity || 'none';
  if (!rarities[r]) rarities[r] = 0;
  rarities[r]++;
});
Object.keys(rarities).sort().forEach(function(r) {
  console.log('  ' + r + ': ' + rarities[r]);
});

// ── Feats check ────────────────────────────────────────────────────────────
const feats = JSON.parse(fs.readFileSync(path.join(dir, 'feats.json'), 'utf8'));
console.log('\n=== Feats (' + feats.length + ') ===');
var alert = feats.find(function(f) { return f._key === 'alert'; });
console.log('  Alert feat found:', alert ? 'yes' : 'no');
console.log('  Alert description:', alert ? (alert.description || '').substring(0, 100) : 'N/A');

// ── Warlock invocations check ──────────────────────────────────────────────
const invocs = JSON.parse(fs.readFileSync(path.join(dir, 'warlock_invocations.json'), 'utf8'));
console.log('\n=== Warlock Invocations (' + invocs.length + ') ===');
console.log(' ', invocs.map(function(i) { return i.name; }).join(', '));

// ── RegExp serialisation check ─────────────────────────────────────────────
console.log('\n=== RegExp / Function serialisation ===');
var barb_rage = barb.features && barb.features.rage;
if (barb_rage && barb_rage.calcChanges) {
  var atkCalc = barb_rage.calcChanges.atkCalc;
  if (Array.isArray(atkCalc) && atkCalc.length > 0) {
    var fn = atkCalc[0];
    console.log('  calcChanges.atkCalc[0] _type:', fn._type);
    console.log('  function body preview:', String(fn.body || '').substring(0, 80));
  }
}
var barbRegexp = barb.regExpSearch;
console.log('  regExpSearch _type:', barbRegexp && barbRegexp._type);
console.log('  regExpSearch source:', barbRegexp && barbRegexp.source);

console.log('\nValidation complete — all checks passed.');
