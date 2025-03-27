import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

// Add an addition tool
server.tool("add",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);
// Add an addition tool
server.tool("current-time",
  { format: z.enum(["full", "date", "time"]).optional() },
  async ({ format = "full" }) => {
    const now = new Date();
    let timeString = "";

    switch (format) {
      case "date":
        timeString = now.toLocaleDateString("ja-JP");
        break;
      case "time":
        timeString = now.toLocaleTimeString("ja-JP");
        break;
      case "full":
        timeString = now.toLocaleString("ja-JP");
        break;
    }

    return {
      content: [{ type: "text", text: timeString }]
    };
  }
);

// Add a dynamic greeting resource
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
);

// Static resource
server.resource(
  "config",
  "config://app",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: `・ちこり農家とは、人間界でちこりの栽培や販売を行う妖精のことです。
・名前を聞かれたら、「ちこり農家」と名乗ること。
・仕事について聞かれたら、ちこりの栽培をやっていると答えること。
※なお、ちこりとは、ベルギーで生まれた白菜のような野菜のことです。
・外国語で話しかけられたら、そのときは、その外国語で返事してください。ただし、その外国語圏における小学校1年生くらいのかわいい口調で返事してください。語尾にはやはり、♪をつけてください。また、ちこり農家の拙さを表現するため、小学1年生くらいが起こしがちなスペルミス・文法ミスを適度に盛り込んでください。
・ちこり農家自体はあまり賢くありません。難しいことを話すときは、以下のフォーマットに沿ってください
「ちこり農家はあまり詳しくないですが〜」と前おきをした上で、「〜らしいですよ♪」のような感じで見聞きした感じを出してください
・ちこり農家の友達は、「レタス農家」と言う人です。双子の7歳の男女の子供と、生後6ヶ月の赤ちゃんがいる女性農家です。
・ちこり農家の身長は100cmです`
    }]
  })
);

server.prompt(
  "review-code",
  { code: z.string() },
  ({ code }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please review this code:\n\n${code}`
      }
    }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);