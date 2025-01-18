import { NeuroscienceTopic } from "@/utils/constants";
import SearchPage from "../page_utils/Search";

export default function NeuroSearch() {
  return (
    <div>
      <SearchPage topic={NeuroscienceTopic} />
    </div>
  )
};