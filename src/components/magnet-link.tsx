import { useMemo } from "react";

export const MagnetLink = ({
  name,
  hash,
  includeTrackers,
}: {
  name: string;
  hash: string;
  includeTrackers: boolean;
}) => {
  const href = useMemo(() => {
    if (!isValidHash(hash)) return null;
    const trackers = includeTrackers ? defaultTrackers : [];
    return generateMagnetLink(hash, name, trackers);
  }, [hash, name, includeTrackers]);

  if (!href) return null;

  return (
    <a
      href={href}
      className="font-medium text-primary-600 underline dark:text-primary-500 hover:no-underline"
    >
      Magnet Link
    </a>
  );
};

const defaultTrackers = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://tracker.coppersurfer.tk:6969/announce",
  "udp://tracker.leechers-paradise.org:6969/announce",
];

const isValidHash = (hash?: string | null) => {
  if (!hash) return false;

  const hexRegex = /^[a-fA-F0-9]{40}$/; // 40 hexadecimal characters
  const base32Regex = /^[A-Z2-7]{32}$/; // 32 Base32 characters
  return hexRegex.test(hash) || base32Regex.test(hash);
};

function generateMagnetLink(
  hash: string,
  name: string,
  trackers: string[]
): string {
  const params = new URLSearchParams();
  params.set("xt", `urn:btih:${hash}`);
  if (name) {
    params.set("dn", encodeURIComponent(name));
  }
  for (const tracker of trackers) {
    params.append("tr", encodeURIComponent(tracker));
  }

  return `magnet:?${params.toString()}`;
}
