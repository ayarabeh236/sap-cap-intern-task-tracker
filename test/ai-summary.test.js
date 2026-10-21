import cds from "@sap/cds";
import { mock } from "node:test";
import { geminiClient } from "../srv/gemini-client.js";

const { POST, expect } = cds.test();

describe("AI Weekly Summary", () => {
  it("AI-02 - mentor can generate a summary for their intern without calling Gemini", async () => {
    const mockedGenerate = mock.method(
      geminiClient,
      "generateWeeklySummary",
      async () => "Mock weekly summary",
    );

    try {
      const { data, status } = await POST(
        "/odata/v4/internship/Interns(11111111-1111-1111-1111-111111111111)/InternshipService.generateWeeklySummary",
        {},
        {
          auth: {
            username: "mentor",
            password: "mentor",
          },
        },
      );

      expect(status).to.equal(200);
      expect(data.value).to.equal("Mock weekly summary");

      expect(mockedGenerate.mock.callCount()).to.equal(1);
    } finally {
      mockedGenerate.mock.restore();
    }
  });
});
