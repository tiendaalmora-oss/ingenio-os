import { getEngineData } from "./actions";
import { MissionControlUI } from "@/components/mission-control-ui";

export default async function Page() {
  const data = await getEngineData();
  
  return <MissionControlUI {...data} />;
}
