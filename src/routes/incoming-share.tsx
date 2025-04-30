import React, { useEffect } from "react";
import { openDB } from "idb";

interface Props {
  onPopulate: (data: { text?: string; hash?: string }) => void;
}

const IncomingShare: React.FC<Props> = ({ onPopulate }) => {
  useEffect(() => {
    (async () => {
      const db = await openDB("share-db", 1);
      const all = await db.getAll("shared");
      const latest = all[all.length - 1];
      if (latest) {
        onPopulate(latest as { text?: string; hash?: string });
      }
    })();
  }, [onPopulate]);

  return (
    <div style={{ padding: 20 }}>
      <p>Loading shared content...</p>
    </div>
  );
};

export default IncomingShare;
