import { useEffect, useState } from "react";

export function useLocalstorageState() {
  const [watched, setWatched] = useState(() => {
    const dataLoc = localStorage.getItem("watched");
    return JSON.parse(dataLoc) || [];
  });

  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);

  return [watched, setWatched ];
}
