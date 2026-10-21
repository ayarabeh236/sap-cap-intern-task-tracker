import cds from "@sap/cds";
import { writeAuditLog } from "./audit-log.js";

const { SELECT, UPDATE } = cds.ql;

export default cds.service.impl(async function () {
  const { Tasks, Interns, ProgressUpdates } =
    cds.entities("intern.tasktracker");

  const { MyTasks, MyProgressUpdates } = this.entities;

  const validateProgressUpdate = async (req) => {
    let taskId = req.data?.task_ID;

    // CREATE / UPDATE via navigation :
    // /MyTasks(...)/progressUpdates(...)
    if (!taskId && req.params?.length > 1) {
      taskId = req.params[0]?.ID;
    }

    // CREATE via :
    // /MyTasks(...)/progressUpdates
    if (!taskId && req.event === "CREATE" && req.params?.length === 1) {
      taskId = req.params[0]?.ID;
    }

    // UPDATE direct d'un Progress Update existant
    if (!taskId) {
      const progressUpdateId = req.data?.ID ?? req.params?.[0]?.ID;

      if (progressUpdateId) {
        const progressUpdate = await SELECT.one
          .from(ProgressUpdates)
          .columns("task_ID")
          .where({ ID: progressUpdateId });

        taskId = progressUpdate?.task_ID;
      }
    }

    if (!taskId) {
      return req.reject(400, "Task is required.");
    }

    const task = await SELECT.one
      .from(Tasks)
      .columns("intern_ID", "status")
      .where({ ID: taskId });

    if (!task) {
      return req.reject(404, "Task not found.");
    }

    // Une Task terminée ou annulée est verrouillée
    if (["AWAITING_REVIEW", "COMPLETED", "CANCELLED"].includes(task.status)) {
      return req.reject(
        409,
        "Progress updates cannot be modified after the task is awaiting review, completed or cancelled.",
      );
    }

    const intern = await SELECT.one
      .from(Interns)
      .columns("authUserId")
      .where({ ID: task.intern_ID });

    if (!intern || intern.authUserId !== req.user.id) {
      return req.reject(
        403,
        "You can only add progress updates to your own tasks.",
      );
    }
  };

  // Active entity
  this.before(["CREATE", "UPDATE"], MyProgressUpdates, validateProgressUpdate);

  // Draft entity
  this.before("CREATE", MyProgressUpdates.drafts, validateProgressUpdate);

  this.before("PATCH", MyProgressUpdates.drafts, validateProgressUpdate);

  this.after("CREATE", MyProgressUpdates, async (data, req) => {
    await writeAuditLog(req, {
      action: "CREATE_PROGRESS_UPDATE",
      entityType: "ProgressUpdate",
      entityID: data.ID,
      actorRole: "Intern",
      description: `Progress update created with progress ${data.progress}%.`,
    });
  });
  const transitionTask = async (
    req,
    expectedStatus,
    nextStatus,
    errorMessage,
    auditAction,
  ) => {
    const taskId = req.params?.[0]?.ID;

    if (!taskId) {
      return req.reject(400, "Task ID is required.");
    }

    const currentTask = await SELECT.one
      .from(Tasks)
      .columns("status")
      .where({ ID: taskId });

    if (!currentTask) {
      return req.reject(404, "Task not found.");
    }

    if (currentTask.status !== expectedStatus) {
      return req.reject(409, errorMessage);
    }

    await UPDATE(Tasks).set({ status: nextStatus }).where({ ID: taskId });

    await writeAuditLog(req, {
      action: auditAction,
      entityType: "Task",
      entityID: taskId,
      actorRole: "Intern",
      description: `Task status changed from ${expectedStatus} to ${nextStatus}.`,
    });
  };

  this.on("startTask", "MyTasks", async (req) => {
    return transitionTask(
      req,
      "OPEN",
      "IN_PROGRESS",
      "Only open tasks can be started.",
      "START_TASK",
    );
  });

  this.on("blockTask", "MyTasks", async (req) => {
    return transitionTask(
      req,
      "IN_PROGRESS",
      "BLOCKED",
      "Only tasks in progress can be blocked.",
      "BLOCK_TASK",
    );
  });

  this.on("resumeTask", "MyTasks", async (req) => {
    return transitionTask(
      req,
      "BLOCKED",
      "IN_PROGRESS",
      "Only blocked tasks can be resumed.",
      "RESUME_TASK",
    );
  });

  this.on("submitForReview", "MyTasks", async (req) => {
    return transitionTask(
      req,
      "IN_PROGRESS",
      "AWAITING_REVIEW",
      "Only tasks in progress can be submitted for review.",
      "SUBMIT_FOR_REVIEW",
    );
  });

  const rejectCompletedTaskEdit = async (req) => {
    const taskId = req.data?.ID ?? req.params?.[0]?.ID;

    if (!taskId) return;

    const task = await SELECT.one
      .from(Tasks)
      .columns("status")
      .where({ ID: taskId });

    if (!task) {
      return req.reject(404, "Task not found.");
    }

    if (task.status === "COMPLETED") {
      return req.reject(409, "Completed tasks can no longer be modified.");
    }
  };
  this.before("EDIT", MyTasks, rejectCompletedTaskEdit);

  this.before("UPDATE", MyTasks, rejectCompletedTaskEdit);

  this.before("SAVE", MyTasks.drafts, rejectCompletedTaskEdit);
});
