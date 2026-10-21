import cds from "@sap/cds";

const { GET, expect } = cds.test();

describe("Dashboard - ManagerService", () => {
  it("DASH-01 - manager dashboard returns correct KPIs", async () => {
    const { data, status } = await GET("/odata/v4/manager/DashboardKPIs", {
      auth: {
        username: "manager",
        password: "manager",
      },
    });

    expect(status).to.equal(200);

    expect(data.totalTasks).to.equal(6);
    expect(data.openTasks).to.equal(2);
    expect(data.inProgressTasks).to.equal(2);
    expect(data.awaitingReviewTasks).to.equal(0);
    expect(data.blockedTasks).to.equal(1);
    expect(data.completedTasks).to.equal(1);
    expect(data.cancelledTasks).to.equal(0);

    expect(data.overdueTasks).to.equal(5);

    expect(Number(data.completionRate)).to.equal(16.67);
  });

  describe("Dashboard - InternshipService", () => {
    it("DASH-02 - mentor dashboard returns KPIs only for their interns", async () => {
      const { data, status } = await GET(
        "/odata/v4/internship/MentorDashboardKPIs",
        {
          auth: {
            username: "mentor",
            password: "mentor",
          },
        },
      );

      expect(status).to.equal(200);

      expect(data.assignedInterns).to.equal(2);
      expect(data.totalTasks).to.equal(4);

      expect(data.inProgressTasks).to.equal(1);
      expect(data.awaitingReviewTasks).to.equal(0);
      expect(data.blockedTasks).to.equal(1);
      expect(data.completedTasks).to.equal(0);
      expect(data.cancelledTasks).to.equal(0);

      expect(data.overdueTasks).to.equal(4);

      expect(Number(data.completionRate)).to.equal(0);
    });
  });
});
