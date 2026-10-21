import cds from "@sap/cds";
import { writeAuditLog } from "./audit-log.js";

const { SELECT, UPDATE } = cds.ql;

export default cds.service.impl(function () {
  const { Tasks, Interns } = cds.entities("intern.tasktracker");

  this.on("cancelTask", "Tasks", async (req) => {
    const taskId = req.params?.[0]?.ID;

    if (!taskId) {
      return req.reject(400, "Task ID is required.");
    }

    // Récupérer la tâche actuelle
    const task = await SELECT.one
      .from(Tasks)
      .columns("status")
      .where({ ID: taskId });

    if (!task) {
      return req.reject(404, "Task not found.");
    }

    // Une tâche terminée ne peut plus être annulée
    if (task.status === "COMPLETED") {
      return req.reject(409, "Completed tasks cannot be cancelled.");
    }

    // Annuler la tâche
    await UPDATE(Tasks).set({ status: "CANCELLED" }).where({ ID: taskId });

    await writeAuditLog(req, {
      action: "CANCEL_TASK",
      entityType: "Task",
      entityID: taskId,
      actorRole: "Manager",
      description: `Task status changed from ${task.status} to CANCELLED.`,
    });
  });

  this.before("UPDATE", "Tasks", async (req) => {
    // On vérifie seulement si intern_ID est envoyé dans la modification
    if (!req.data.intern_ID) return;

    const taskId = req.data.ID ?? req.params?.[0]?.ID;

    if (!taskId) return;

    const currentTask = await SELECT.one
      .from(Tasks)
      .columns("intern_ID")
      .where({ ID: taskId });

    if (!currentTask) {
      return req.reject(404, "Task not found.");
    }

    // L'Intern choisi lors de la création ne peut plus être changé
    if (currentTask.intern_ID !== req.data.intern_ID) {
      return req.reject(
        400,
        "Intern assignment cannot be changed after task creation.",
      );
    }
  });

  this.on("READ", "DashboardKPIs", async (req) => {
    const today = new Date().toISOString().slice(0, 10);

    const tasks = await SELECT.from(Tasks);

    // -------------------------
    // TOTAL TASKS
    // -------------------------
    const totalTasks = tasks.length;

    // -------------------------
    // OPEN
    // -------------------------
    const openTasks = tasks.filter((task) => task.status === "OPEN").length;

    // -------------------------
    // IN PROGRESS
    // -------------------------
    const inProgressTasks = tasks.filter(
      (task) => task.status === "IN_PROGRESS",
    ).length;

    // -------------------------
    // AWAITING REVIEW
    // -------------------------
    const awaitingReviewTasks = tasks.filter(
      (task) => task.status === "AWAITING_REVIEW",
    ).length;

    // -------------------------
    // BLOCKED
    // -------------------------
    const blockedTasks = tasks.filter(
      (task) => task.status === "BLOCKED",
    ).length;

    // -------------------------
    // COMPLETED
    // -------------------------
    const completedTasks = tasks.filter(
      (task) => task.status === "COMPLETED",
    ).length;

    // -------------------------
    // CANCELLED
    // -------------------------
    const cancelledTasks = tasks.filter(
      (task) => task.status === "CANCELLED",
    ).length;

    // -------------------------
    // OVERDUE
    // -------------------------
    const overdueTasks = tasks.filter((task) => {
      return (
        task.dueDate &&
        task.dueDate < today &&
        task.status !== "COMPLETED" &&
        task.status !== "CANCELLED"
      );
    }).length;

    // -------------------------
    // COMPLETION RATE
    // -------------------------

    // Les tâches CANCELLED ne doivent pas pénaliser
    // le taux de complétion.
    const activeTasks = tasks.filter((task) => task.status !== "CANCELLED");

    const completionRate =
      activeTasks.length === 0
        ? 0
        : Number(((completedTasks / activeTasks.length) * 100).toFixed(2));

    // -------------------------
    // RESPONSE
    // -------------------------
    return {
      ID: "dashboard",

      totalTasks,
      openTasks,
      inProgressTasks,
      awaitingReviewTasks,
      blockedTasks,
      overdueTasks,
      completedTasks,
      cancelledTasks,
      completionRate,
    };
  });

  this.on("READ", "DashboardKPIsByIntern", async (req) => {
    const today = new Date().toISOString().slice(0, 10);

    // Récupérer l'internID depuis le filtre OData
    const where = req.query.SELECT?.where;

    let internID;

    if (where) {
      for (let i = 0; i < where.length; i++) {
        if (where[i]?.ref?.[0] === "internID" && where[i + 1] === "=") {
          internID = where[i + 2]?.val;
          break;
        }
      }
    }

    if (!internID) {
      return [];
    }

    const tasks = await SELECT.from(Tasks).where({
      intern_ID: internID,
    });

    const totalTasks = tasks.length;

    const openTasks = tasks.filter((task) => task.status === "OPEN").length;

    const inProgressTasks = tasks.filter(
      (task) => task.status === "IN_PROGRESS",
    ).length;

    const awaitingReviewTasks = tasks.filter(
      (task) => task.status === "AWAITING_REVIEW",
    ).length;

    const blockedTasks = tasks.filter(
      (task) => task.status === "BLOCKED",
    ).length;

    const completedTasks = tasks.filter(
      (task) => task.status === "COMPLETED",
    ).length;

    const cancelledTasks = tasks.filter(
      (task) => task.status === "CANCELLED",
    ).length;

    const overdueTasks = tasks.filter((task) => {
      return (
        task.dueDate &&
        task.dueDate < today &&
        task.status !== "COMPLETED" &&
        task.status !== "CANCELLED"
      );
    }).length;

    const activeTasks = tasks.filter((task) => task.status !== "CANCELLED");

    const completionRate =
      activeTasks.length === 0
        ? 0
        : Number(((completedTasks / activeTasks.length) * 100).toFixed(2));

    const intern = await SELECT.one.from(Interns).where({ ID: internID });

    return [
      {
        internID,
        internName: intern ? `${intern.firstName} ${intern.lastName}` : "",
        totalTasks,
        openTasks,
        inProgressTasks,
        awaitingReviewTasks,
        blockedTasks,
        overdueTasks,
        completedTasks,
        cancelledTasks,
        completionRate,
      },
    ];
  });
});
