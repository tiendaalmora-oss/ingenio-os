import { getEngineData } from "./actions";
import { MissionControlUI } from "@/components/mission-control-ui";
import { redirect } from "next/navigation";

export default async function Page() {
  const data = await getEngineData();
  
  if (!data) {
    redirect("/onboarding");
  }

  return <MissionControlUI />;
}
