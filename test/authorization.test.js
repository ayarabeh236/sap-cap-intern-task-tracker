import cds from "@sap/cds";

const { GET, POST, expect } = cds.test();

describe("Authorization - InternService", () => {
  it("AUTH-01 - intern sees only their own tasks", async () => {
    const { data, status } = await GET("/odata/v4/intern/MyTasks?$select=ID", {
      auth: {
        username: "intern",
        password: "intern",
      },
    });

    const returnedTaskIds = data.value.map((task) => task.ID).sort();

    const expectedTaskIds = [
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
    ].sort();

    expect(returnedTaskIds).to.deep.equal(expectedTaskIds);
    expect(status).to.equal(200);
  });
});

describe("Authorization - InternshipService", () => {
  it("AUTH-02 - mentor sees only tasks of their interns", async () => {
    const { data, status } = await GET(
      "/odata/v4/internship/Tasks?$select=ID",
      {
        auth: {
          username: "mentor",
          password: "mentor",
        },
      },
    );

    const returnedTaskIds = data.value.map((task) => task.ID).sort();

    const expectedTaskIds = [
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
      "cccccccc-cccc-cccc-cccc-ccccccccccc1",
      "cccccccc-cccc-cccc-cccc-ccccccccccc2",
    ].sort();

    expect(returnedTaskIds).to.deep.equal(expectedTaskIds);
    expect(status).to.equal(200);
  });
});

describe("Authorization - ManagerService", () => {
  it("AUTH-03 - intern cannot access ManagerService", async () => {
    let error;

    try {
      await GET("/odata/v4/manager/Tasks?$select=ID", {
        auth: {
          username: "intern",
          password: "intern",
        },
      });
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error.response.status).to.equal(403);
  });
});

describe("Authorization - Mentor ProgressUpdates", () => {
  it("AUTH-04 - mentor sees only progress updates of their interns", async () => {
    const { data, status } = await GET(
      "/odata/v4/internship/ProgressUpdates?$select=ID",
      {
        auth: {
          username: "mentor",
          password: "mentor",
        },
      },
    );

    const returnedIds = data.value.map((update) => update.ID).sort();

    const expectedIds = [
      // Sara
      "dddddddd-dddd-dddd-dddd-ddddddddddd1",
      "dddddddd-dddd-dddd-dddd-ddddddddddd2",
      "dddddddd-dddd-dddd-dddd-ddddddddddd3",

      // Lina
      "ffffffff-ffff-ffff-ffff-fffffffffff1",
      "ffffffff-ffff-ffff-ffff-fffffffffff2",
    ].sort();

    expect(returnedIds).to.deep.equal(expectedIds);
    expect(status).to.equal(200);
  });
});

describe("Authorization - AI Weekly Summary", () => {
  it("AI-01 - mentor cannot generate summary for an intern they do not mentor", async () => {
    let error;

    try {
      await POST(
        "/odata/v4/internship/Interns(22222222-2222-2222-2222-222222222222)/InternshipService.generateWeeklySummary",
        {},
        {
          auth: {
            username: "mentor",
            password: "mentor",
          },
        },
      );
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error.response.status).to.equal(403);
  });
});
