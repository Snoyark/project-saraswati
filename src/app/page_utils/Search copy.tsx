
type SearchArgs = {
  topic_name: string;
};
/**
 * 
 * @param args 
 * @returns A React component to search a topic, which will be passed in via the args
 */
export default function SearchPage(args: SearchArgs) {
  
  return (
    <div>
      {`${args.topic_name} Search Page`}
    </div>
  );
}
