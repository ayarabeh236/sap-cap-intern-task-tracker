import cds from "@sap/cds";

const { POST, expect } = cds.test();
const { UPDATE } = cds.ql;

describe("Progress Updates - InternService", () => {
  it("PROG-01 - intern can create a progress update for their own task", async () => {
    const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";

    const { data, status } = await POST(
      `/odata/v4/intern/MyTasks(ID=${taskId},IsActiveEntity=true)/progressUpdates`,
      {
        progress: 70,
        blocker: false,
        comments: "Backend almost finished",
      },
      {
        auth: {
          username: "intern",
          password: "intern",
        },
      },
    );

    expect(status).to.equal(201);
    expect(data.progress).to.equal(70);
  });

  it("PROG-02 - intern cannot create a progress update for an AWAITING_REVIEW task", async () => {
    const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";

    // Préparation de l'état
    await UPDATE("intern.tasktracker.Tasks")
      .set({ status: "AWAITING_REVIEW" })
      .where({ ID: taskId });

    let error;

    try {
      await POST(
        `/odata/v4/intern/MyTasks(ID=${taskId},IsActiveEntity=true)/progressUpdates`,
        {
          progress: 80,
          blocker: false,
          comments: "This update should be rejected",
        },
        {
          auth: {
            username: "intern",
            password: "intern",
          },
        },
      );
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error.response.status).to.equal(409);
  });

  it("PROG-03 - intern cannot create a progress update for another intern's task", async () => {
    const taskId = "cccccccc-cccc-cccc-cccc-ccccccccccc2";

    let error;

    try {
      await POST(
        `/odata/v4/intern/MyTasks(ID=${taskId},IsActiveEntity=true)/progressUpdates`,
        {
          progress: 40,
          blocker: false,
          comments: "Unauthorized progress update",
        },
        {
          auth: {
            username: "intern",
            password: "intern",
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
