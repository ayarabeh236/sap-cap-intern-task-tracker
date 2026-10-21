import cds from "@sap/cds";

const { GET, POST, expect } = cds.test();
const { UPDATE } = cds.ql;

describe("Audit Logs", () => {
  const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";

  beforeEach(async () => {
    // blockTask exige une tâche IN_PROGRESS
    const { Tasks } = cds.entities("intern.tasktracker");

    await UPDATE(Tasks).set({ status: "IN_PROGRESS" }).where({ ID: taskId });
  });

  it("AUDIT-01 - blocking a task creates an audit log", async () => {
    // 1. L'intern bloque sa tâche
    const { status } = await POST(
      `/odata/v4/intern/MyTasks(${taskId})/InternService.blockTask`,
      {},
      {
        auth: {
          username: "intern",
          password: "intern",
        },
      },
    );

    expect(status).to.equal(204);

    // 2. Le manager consulte les AuditLogs
    const { data } = await GET("/odata/v4/manager/AuditLogs", {
      auth: {
        username: "manager",
        password: "manager",
      },
    });

    // 3. Chercher le log correspondant
    const auditLog = data.value.find(
      (log) => log.action === "BLOCK_TASK" && log.entityID === taskId,
    );

    expect(auditLog).to.exist;

    expect(auditLog.entityType).to.equal("Task");
    expect(auditLog.actorRole).to.equal("Intern");
    expect(auditLog.createdBy).to.equal("intern");

    expect(auditLog.description).to.equal(
      "Task status changed from IN_PROGRESS to BLOCKED.",
    );
  });
});
