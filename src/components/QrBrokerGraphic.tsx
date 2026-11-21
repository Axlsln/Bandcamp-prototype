interface QrBrokerGraphicProps {
  seed: string;
}

export function QrBrokerGraphic({ seed }: QrBrokerGraphicProps) {
  const size = 21;
  const cells: boolean[] = [];

  // Deterministic pseudo-random matrix with authentic 3-corner finder patterns
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinder = (r: number, c: number, top: number, left: number) => {
    const dr = r - top;
    const dc = c - left;
    if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return null;
    if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
    if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) return true;
    return false;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const f1 = isFinder(r, c, 0, 0);
      const f2 = isFinder(r, c, 0, size - 7);
      const f3 = isFinder(r, c, size - 7, 0);
      if (f1 !== null) {
        cells.push(f1);
      } else if (f2 !== null) {
        cells.push(f2);
      } else if (f3 !== null) {
        cells.push(f3);
      } else {
        hash = Math.imul(hash ^ (r * 31 + c), 16777619);
        cells.push((hash >>> 24) % 2 === 0);
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200"
      role="img"
      aria-label={`Carrier drop-off QR code ${seed}`}
    >
      {cells.map((filled, idx) => {
        if (!filled) return null;
        const x = idx % size;
        const y = Math.floor(idx / size);
        return <rect key={idx} x={x} y={y} width={1} height={1} fill="#1F2326" />;
      })}
    </svg>
  );
}
