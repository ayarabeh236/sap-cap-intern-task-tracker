import cds from "@sap/cds";
const { UPDATE } = cds.ql;

const { GET, POST, expect } = cds.test();

beforeEach(async () => {
  await UPDATE("intern.tasktracker.Tasks")
    .set({ status: "IN_PROGRESS" })
    .where({ ID: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1" });

  await UPDATE("intern.tasktracker.Tasks")
    .set({ status: "OPEN" })
    .where({ ID: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2" });
});
describe("Task lifecycle - InternService", () => {
  it("LIFE-01 - intern can start an OPEN task", async () => {
    const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2";

    await POST(
      `/odata/v4/intern/MyTasks(${taskId})/InternService.startTask`,
      {},
      {
        auth: {
          username: "intern",
          password: "intern",
        },
      },
    );

    const { data, status } = await GET(
      `/odata/v4/intern/MyTasks(${taskId})?$select=status`,
      {
        auth: {
          username: "intern",
          password: "intern",
        },
      },
    );

    expect(status).to.equal(200);
    expect(data.status).to.equal("IN_PROGRESS");
  });

  it("LIFE-02 - intern can block an IN_PROGRESS task", async () => {
    const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";

    await POST(
      `/odata/v4/intern/MyTasks(${taskId})/InternService.blockTask`,
      {},
      {
        auth: {
          username: "intern",
          password: "intern",
        },
      },
    );

    const { data, status } = await GET(
      `/odata/v4/intern/MyTasks(${taskId})?$select=status`,
      {
        auth: {
          username: "intern",
          password: "intern",
        },
      },
    );

    expect(status).to.equal(200);
    expect(data.status).to.equal("BLOCKED");
  });

  it("LIFE-03 - intern can resume a BLOCKED task", async () => {
    const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";

    // Préparation spécifique du test
    await UPDATE("intern.tasktracker.Tasks")
      .set({ status: "BLOCKED" })
      .where({ ID: taskId });

    // Action réellement testée
    await POST(
      `/odata/v4/intern/MyTasks(${taskId})/InternService.resumeTask`,
      {},
      {
        auth: {
          username: "intern",
          password: "intern",
        },
      },
    );

    const { data, status } = await GET(
      `/odata/v4/intern/MyTasks(${taskId})?$select=status`,
      {
        auth: {
          username: "intern",
          password: "intern",
        },
      },
    );

    expect(status).to.equal(200);
    expect(data.status).to.equal("IN_PROGRESS");
  });

  it("LIFE-04 - intern can submit an IN_PROGRESS task for review", async () => {
    const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";

    await POST(
      `/odata/v4/intern/MyTasks(${taskId})/InternService.submitForReview`,
      {},
      {
        auth: {
          username: "intern",
          password: "intern",
        },
      },
    );

    const { data, status } = await GET(
      `/odata/v4/intern/MyTasks(${taskId})?$select=status`,
      {
        auth: {
          username: "intern",
          password: "intern",
        },
      },
    );

    expect(status).to.equal(200);
    expect(data.status).to.equal("AWAITING_REVIEW");
  });
});

describe("Task lifecycle - InternshipService", () => {
  it("LIFE-05 - mentor can complete an AWAITING_REVIEW task", async () => {
    const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";

    // Préparation spécifique : mettre la tâche en AWAITING_REVIEW
    await UPDATE("intern.tasktracker.Tasks")
      .set({ status: "AWAITING_REVIEW" })
      .where({ ID: taskId });

    // Action réellement testée
    await POST(
      `/odata/v4/internship/Tasks(${taskId})/InternshipService.completeTask`,
      {},
      {
        auth: {
          username: "mentor",
          password: "mentor",
        },
      },
    );

    const { data, status } = await GET(
      `/odata/v4/internship/Tasks(${taskId})?$select=status`,
      {
        auth: {
          username: "mentor",
          password: "mentor",
        },
      },
    );

    expect(status).to.equal(200);
    expect(data.status).to.equal("COMPLETED");
  });

  it("LIFE-06 - mentor can request changes on an AWAITING_REVIEW task", async () => {
    const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";

    // Préparation
    await UPDATE("intern.tasktracker.Tasks")
      .set({ status: "AWAITING_REVIEW" })
      .where({ ID: taskId });

    // Action testée
    await POST(
      `/odata/v4/internship/Tasks(${taskId})/InternshipService.requestChanges`,
      {},
      {
        auth: {
          username: "mentor",
          password: "mentor",
        },
      },
    );

    const { data, status } = await GET(
      `/odata/v4/internship/Tasks(${taskId})?$select=status`,
      {
        auth: {
          username: "mentor",
          password: "mentor",
        },
      },
    );

    expect(status).to.equal(200);
    expect(data.status).to.equal("IN_PROGRESS");
  });
});

describe("Task lifecycle - ManagerService", () => {
  it("LIFE-07 - manager can cancel a non-completed task", async () => {
    const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2";

    // Préparation : rendre l'état du test totalement indépendant
    await UPDATE("intern.tasktracker.Tasks")
      .set({ status: "OPEN" })
      .where({ ID: taskId });

    // Action réellement testée
    await POST(
      `/odata/v4/manager/Tasks(${taskId})/ManagerService.cancelTask`,
      {},
      {
        auth: {
          username: "manager",
          password: "manager",
        },
      },
    );

    const { data, status } = await GET(
      `/odata/v4/manager/Tasks(${taskId})?$select=status`,
      {
        auth: {
          username: "manager",
          password: "manager",
        },
      },
    );

    expect(status).to.equal(200);
    expect(data.status).to.equal("CANCELLED");
  });

  it("LIFE-08 - manager cannot cancel a COMPLETED task", async () => {
    const taskId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1";

    let error;

    try {
      await POST(
        `/odata/v4/manager/Tasks(${taskId})/ManagerService.cancelTask`,
        {},
        {
          auth: {
            username: "manager",
            password: "manager",
          },
        },
      );
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error.response.status).to.equal(409);
  });
});
