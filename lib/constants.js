export const FALLBACK_LOCATION = { lat: 30.4598, lng: 78.0664 };

export const VILLAGE_SEED = [
  { id: 'v1', name: 'Bhatwari', latOffset: 0.006, lngOffset: -0.010 },
  { id: 'v2', name: 'Gangnani', latOffset: 0.018, lngOffset: 0.014 },
  { id: 'v3', name: 'Netala',   latOffset: -0.012, lngOffset: 0.008 },
  { id: 'v4', name: 'Dharasu',  latOffset: 0.004, lngOffset: 0.022 },
];

export const SHELTER_SEED = [
  { id: 's1', name: 'Govt. School Shelter', latOffset: 0.003, lngOffset: -0.006, capacity: 120 },
  { id: 's2', name: 'Community Hall',       latOffset: 0.010, lngOffset: 0.006, capacity: 80 },
  { id: 's3', name: 'Panchayat Bhawan',     latOffset: -0.008, lngOffset: -0.003, capacity: 60 },
];

export const HELPLINES = [
  { name: 'National Disaster Helpline', number: '1078' },
  { name: 'Police', number: '100' },
  { name: 'National Emergency Number', number: '112' },
];

export const CATEGORIES = ['Flood', 'Landslide', 'Fire', 'Other'];

export const STATE_STYLES = {
  NORMAL:    { color: '#4c8c6b', bg: '#ecfdf5', label: 'Normal' },
  WATCH:     { color: '#d9a441', bg: '#fffbeb', label: 'Watch' },
  SUSPECTED: { color: '#d9a441', bg: '#fffbeb', label: 'Suspected' },
  VERIFIED:  { color: '#c1432d', bg: '#fef2f2', label: 'Verified' },
  RESOLVED:  { color: '#94a3b8', bg: '#f8fafc', label: 'Resolved' },
};

export const SEVERITY_RANK = { NORMAL: 0, WATCH: 1, SUSPECTED: 2, VERIFIED: 3, RESOLVED: 0 };
