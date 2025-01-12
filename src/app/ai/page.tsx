import SearchPage from "../page_utils/Search";
import { ArtificialIntelligenceTopic } from "../../utils/constants"

export default function AISearch() {
  return (
    <div>
      <SearchPage topic_name={ArtificialIntelligenceTopic.url_name} />
    </div>
  );
};