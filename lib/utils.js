// Derives a village's alert state from its signals. Pure function so it's
// trivially testable and safe to call from any page/component.
export function computeState(v) {
  if (v.resolved) return 'RESOLVED';
  if (v.rescueConfirmed) return 'VERIFIED';
  const score = v.sensorConfidence + v.reports.length * 25;
  if (score >= 80) return 'VERIFIED';
  if (score >= 60) return 'SUSPECTED';
  if (score >= 30) return 'WATCH';
  return 'NORMAL';
}

export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function explanationText(s, sensorConfidence, reports) {
  if (s === 'NORMAL')
    return 'No unusual signals detected here. Sensor readings and citizen reports are within normal range.';
  if (s === 'WATCH')
    return `Sensor confidence has risen to ${sensorConfidence}%. This is below the level needed for a public alert, so the system is watching this area closely.`;
  if (s === 'SUSPECTED')
    return `Sensor confidence is at ${sensorConfidence}%, and ${reports.length} citizen report(s) have been received. Together these cross the threshold for a suspected event, but haven't been independently confirmed yet.`;
  if (s === 'VERIFIED')
    return `This crisis has been VERIFIED. Sensor confidence: ${sensorConfidence}%. Citizen reports: ${reports.length}. ${
      reports.length >= 2 ? 'Multiple independent reports corroborate this event. ' : ''
    }A rescue-team confirmation can also verify a crisis directly, independent of sensor or report count.`;
  return 'This event has been marked resolved by the response team. Monitoring continues for new signals.';
}

export function nearestVillageId(villages, userLocation) {
  if (!userLocation) return villages[0].id;
  let best = villages[0];
  let bestD = Infinity;
  villages.forEach((v) => {
    const d = distanceKm(
      userLocation.lat,
      userLocation.lng,
      userLocation.lat + v.latOffset,
      userLocation.lng + v.lngOffset
    );
    if (d < bestD) {
      bestD = d;
      best = v;
    }
  });
  return best.id;
}
