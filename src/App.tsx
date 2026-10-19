import "./components/dashboard.css";
import { BoardReplyChart } from "./components/BoardReplyChart";
import { RoleFamilyChart } from "./components/RoleFamilyChart";
import { FunnelChart } from "./components/FunnelChart";
import { OutcomeBreakdown } from "./components/OutcomeBreakdown";
import { TimelineChart } from "./components/TimelineChart";
import { SilenceChart } from "./components/SilenceChart";
import { StageFlowChart } from "./components/StageFlowChart";
import { SankeyFlow } from "./components/SankeyFlow";
export default function App() {
  return (
    <main className="dash">
      <BoardReplyChart />
      <RoleFamilyChart />
      <FunnelChart />
      <StageFlowChart />
      <SankeyFlow />
      <OutcomeBreakdown />
      <TimelineChart />
      <SilenceChart />
    </main>
  );
}
