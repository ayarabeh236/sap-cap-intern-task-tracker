import cds from "@sap/cds";

const { POST, PATCH, expect } = cds.test();

describe("Task validation - InternshipService", () => {
  it("TASK-01 - mentor cannot create a task with a past due date", async () => {
    let error;

    try {
      await POST(
        "/odata/v4/internship/Tasks",
        {
          title: "Invalid due date task",
          description: "Task created for automated testing",
          priority: "HIGH",
          dueDate: "2020-01-01",
          intern_ID: "11111111-1111-1111-1111-111111111111",
        },
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
    expect(error.response.status).to.equal(400);
  });

  it("TASK-02 - mentor cannot create a task for an intern they do not mentor", async () => {
    let error;

    try {
      await POST(
        "/odata/v4/internship/Tasks",
        {
          title: "Unauthorized assignment",
          description: "Task created for automated testing",
          priority: "MEDIUM",
          dueDate: "2030-01-01",
          intern_ID: "22222222-2222-2222-2222-222222222222",
        },
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

  it("TASK-03 - mentor cannot change the intern assigned to an existing task", async () => {
    const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";

    let error;

    try {
      await PATCH(
        `/odata/v4/internship/Tasks(ID=${taskId},IsActiveEntity=true)`,
        {
          intern_ID: "33333333-3333-3333-3333-333333333333",
        },
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
    expect(error.response.status).to.equal(400);
  });
});
