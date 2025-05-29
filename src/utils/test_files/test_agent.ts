import { construct_agent } from "../agents";

const agent = construct_agent()

const main = async () => {
  console.log("Starting...");
  const result = await agent.stream(
    {
      messages: [{
        role: "user",
        content: "Can you tell me about a recent paper in physics?"
      }]
    }
  );
  for await (const chunk of result) {
    if (chunk.agent && chunk.agent.messages && chunk.agent.messages[0] && chunk.agent.messages[0].content && chunk.agent.messages[0].content.length > 0) {
        for (const char of chunk.agent.messages[0].content) {
          process.stdout.write(char);
          // Optional: add a small delay to simulate typing
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        console.log("\n");
    }
  }
  process.exit(0)
}

main()
