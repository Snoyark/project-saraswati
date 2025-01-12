import { NeuroscienceTopic } from "@/utils/constants";
import SearchPage from "../page_utils/Search";

export default function NeuroSearch() {
  return (
    <div>
      <SearchPage topic_name={NeuroscienceTopic.url_name} />
    </div>
  )
};