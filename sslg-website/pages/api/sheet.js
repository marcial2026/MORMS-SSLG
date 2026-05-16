// pages/api/sheet.js
// This runs on the SERVER — no CORS issues ever!

const SHEETS = {
  announcements: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR58WhbJKoBlkicSyz5lu7IJbUNTFjNXfFJsDKOKjFDPQBS9yMDmYkTFUMn4mt1T19s14F3HbLWb91i/pub?gid=0&single=true&output=csv',
  events:        'https://docs.google.com/spreadsheets/d/e/2PACX-1vR58WhbJKoBlkicSyz5lu7IJbUNTFjNXfFJsDKOKjFDPQBS9yMDmYkTFUMn4mt1T19s14F3HbLWb91i/pub?gid=1726742259&single=true&output=csv',
  officers:      'https://docs.google.com/spreadsheets/d/e/2PACX-1vR58WhbJKoBlkicSyz5lu7IJbUNTFjNXfFJsDKOKjFDPQBS9yMDmYkTFUMn4mt1T19s14F3HbLWb91i/pub?gid=2081306311&single=true&output=csv',
  projects:      'https://docs.google.com/spreadsheets/d/e/2PACX-1vR58WhbJKoBlkicSyz5lu7IJbUNTFjNXfFJsDKOKjFDPQBS9yMDmYkTFUMn4mt1T19s14F3HbLWb91i/pub?gid=1934828691&single=true&output=csv',
  achievements:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR58WhbJKoBlkicSyz5lu7IJbUNTFjNXfFJsDKOKjFDPQBS9yMDmYkTFUMn4mt1T19s14F3HbLWb91i/pub?gid=644059998&single=true&output=csv',
  fb_posts:      'https://docs.google.com/spreadsheets/d/e/2PACX-1vR58WhbJKoBlkicSyz5lu7IJbUNTFjNXfFJsDKOKjFDPQBS9yMDmYkTFUMn4mt1T19s14F3HbLWb91i/pub?gid=1805364192&single=true&output=csv',
};

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  return lines.slice(1).map(line => {
    const cols = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { cols.push(cur); cur = ''; }
      else { cur += c; }
    }
    cols.push(cur);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (cols[i] || '').trim().replace(/^"|"$/g, ''); });
    return obj;
  }).filter(r => (r.visible || '').toLowerCase() === 'yes');
}

export default async function handler(req, res) {
  // Allow requests from your website
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  const { tab } = req.query;
  if (!tab || !SHEETS[tab]) {
    return res.status(400).json({ error: 'Invalid tab name', validTabs: Object.keys(SHEETS) });
  }

  try {
    const response = await fetch(SHEETS[tab]);
    if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);
    const csv = await response.text();
    const rows = parseCSV(csv);
    return res.status(200).json({ rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
