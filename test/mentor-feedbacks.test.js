import cds from "@sap/cds";

const { POST, PATCH, expect } = cds.test();
const { UPDATE } = cds.ql;

describe("Mentor Feedbacks - InternshipService", () => {
  it("FEED-01 - mentor cannot create feedback for a task of another mentor", async () => {
    const taskId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2";

    let error;

    try {
      await POST(
        `/odata/v4/internship/Tasks(ID=${taskId},IsActiveEntity=true)/feedbacks`,
        {
          rating: 4,
          recommendations: "Automated test feedback",
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

  it("FEED-02 - mentor cannot create feedback for a COMPLETED task", async () => {
    const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";

    // Préparation
    await UPDATE("intern.tasktracker.Tasks")
      .set({ status: "COMPLETED" })
      .where({ ID: taskId });

    let error;

    try {
      await POST(
        `/odata/v4/internship/Tasks(ID=${taskId},IsActiveEntity=true)/feedbacks`,
        {
          rating: 5,
          recommendations: "This feedback should be rejected",
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
    expect(error.response.status).to.equal(409);
  });

  it("FEED-03 - mentor cannot modify feedback for a CANCELLED task", async () => {
    const taskId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1";
    const feedbackId = "11111111-aaaa-bbbb-cccc-111111111111";

    // Préparation : la tâche devient CANCELLED
    await UPDATE("intern.tasktracker.Tasks")
      .set({ status: "CANCELLED" })
      .where({ ID: taskId });

    let error;

    try {
      await PATCH(
        `/odata/v4/internship/Tasks(ID=${taskId},IsActiveEntity=true)/feedbacks(ID=${feedbackId},IsActiveEntity=true)`,
        {
          recommendations: "This modification should be rejected",
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
    expect(error.response.status).to.equal(409);
  });
});
