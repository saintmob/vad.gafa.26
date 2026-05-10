import { loadData } from "@/lib/data";
import { RosterClient } from "./RosterClient";

export default async function Home() {
  const data = await loadData();
  return <RosterClient initialData={data} />;
}
