export function exportHistoryCSV(history) {
  if (!history.length) return;

  const headers = ['timestamp', 'temperature', 'humidity', 'soilMoisture', 'co2', 'lightLevel', 'uv', 'rainfall'];
  const rows = history.map((h) => [
    new Date(h.timestamp).toISOString(),
    h.temperature ?? '',
    h.humidity ?? '',
    h.soilMoisture ?? '',
    h.co2 ?? '',
    h.lightLevel ?? '',
    h.uv ?? '',
    h.rainfall ?? '',
  ]);

  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `phytopulse-${new Date().toISOString().slice(0, 16).replace('T', '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}