import { loadData } from "@/lib/data";
import { IssuesClient } from "./IssuesClient";

export default async function IssuesPage() {
  const data = await loadData();
  return <IssuesClient initialData={data} isDevelopment={process.env.NODE_ENV === "development"} />;
}
