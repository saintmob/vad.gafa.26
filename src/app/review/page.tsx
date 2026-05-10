import { loadData } from "@/lib/data";
import { ReviewClient } from "./ReviewClient";

export default async function ReviewPage() {
  const data = await loadData();
  return <ReviewClient initialData={data} isDevelopment={process.env.NODE_ENV === "development"} />;
}
