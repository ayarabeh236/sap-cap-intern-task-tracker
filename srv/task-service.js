import cds from "@sap/cds";
import { geminiClient } from "./gemini-client.js";
import { writeAuditLog } from "./audit-log.js";

export default cds.service.impl(function () {
  const {
    Tasks,
    Interns,
    ProgressUpdates,
    MentorFeedbacks: DbMentorFeedbacks,
  } = cds.entities("intern.tasktracker");
  const { Tasks: ServiceTasks, MentorFeedbacks } = this.entities;

  const validateDueDate = async (req) => {
    const { dueDate } = req.data;

    // Si aucune dueDate n'est envoyée, rien à vérifier
    if (!dueDate) return;

    const due = new Date(`${dueDate}T00:00:00`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Nouvelle tâche active OU nouveau draft
    if (req.event === "CREATE") {
      if (due < today) {
        req.error(400, "Due date cannot be in the past.", "dueDate");
      }

      return;
    }

    // Modification d'un draft
    if (req.event === "PATCH") {
      if (due < today) {
        req.error(400, "Due date cannot be in the past.", "dueDate");
      }

      return;
    }

    // Modification de l'entité active
    if (req.event === "UPDATE") {
      const taskId = req.data.ID ?? req.params?.[0]?.ID;

      if (!taskId) return;

      const currentTask = await SELECT.one
        .from(Tasks)
        .columns("dueDate")
        .where({ ID: taskId });

      // Si la date n'a pas changé, on laisse passer
      if (currentTask?.dueDate === dueDate) {
        return;
      }

      // Si elle a changé, elle ne peut pas être passée
      if (due < today) {
        req.error(400, "Due date cannot be in the past.", "dueDate");
      }
    }
  };
  // Entité active
  this.before(["CREATE", "UPDATE"], "Tasks", validateDueDate);
  // Draft
  this.before(["CREATE", "PATCH"], ServiceTasks.drafts, validateDueDate);

  this.after("CREATE", "Tasks", async (data, req) => {
    await writeAuditLog(req, {
      action: "CREATE_TASK",
      entityType: "Task",
      entityID: data.ID,
      actorRole: "Mentor",
      description: `Task "${data.title}" created.`,
    });
  });

  const validateTaskAssignment = async (req, requireIntern = false) => {
    if (!req.user.is("Mentor")) return;

    const internId = req.data.intern_ID;

    // Sur l'entité active, l'intern est obligatoire
    if (!internId) {
      if (requireIntern) {
        return req.reject(400, "An intern must be assigned to the task.");
      }

      return;
    }

    const intern = await SELECT.one
      .from(Interns)
      .columns("mentorAuthUserId")
      .where({ ID: internId });

    if (!intern) {
      return req.reject(404, "Intern not found.");
    }

    if (intern.mentorAuthUserId !== req.user.id) {
      return req.reject(
        403,
        "You can only create tasks for interns you mentor.",
      );
    }
  };
  // Entité active
  this.before("CREATE", "Tasks", async (req) => {
    await validateTaskAssignment(req, true);
  });

  // Draft
  this.before(["CREATE", "PATCH"], this.entities.Tasks.drafts, async (req) => {
    await validateTaskAssignment(req, false);
  });

  this.before("UPDATE", "Tasks", async (req) => {
    // On vérifie seulement si intern_ID est envoyé dans la modification
    if (!req.data.intern_ID) return;

    const taskId = req.data.ID ?? req.params?.[0]?.ID;

    if (!taskId) return;

    const { Tasks } = cds.entities("intern.tasktracker");

    const currentTask = await SELECT.one
      .from(Tasks)
      .columns("intern_ID")
      .where({ ID: taskId });

    if (!currentTask) {
      return req.reject(404, "Task not found.");
    }

    // Si l'intern change → on bloque
    if (currentTask.intern_ID !== req.data.intern_ID) {
      return req.reject(
        400,
        "Intern assignment cannot be changed after task creation.",
      );
    }
  });

  const validateMentorFeedback = async (req) => {
    if (!req.user.is("Mentor")) return;

    let taskId = req.data?.task_ID;

    // CREATE / UPDATE via navigation :
    // /Tasks(...)/feedbacks(...)
    if (!taskId && req.params?.length > 1) {
      taskId = req.params[0]?.ID;
    }

    // CREATE via :
    // /Tasks(...)/feedbacks
    if (!taskId && req.event === "CREATE" && req.params?.length === 1) {
      taskId = req.params[0]?.ID;
    }

    // UPDATE direct d'un feedback existant
    if (!taskId) {
      const feedbackId = req.data?.ID ?? req.params?.[0]?.ID;

      if (feedbackId) {
        const feedback = await SELECT.one
          .from(DbMentorFeedbacks)
          .columns("task_ID")
          .where({ ID: feedbackId });

        taskId = feedback?.task_ID;
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

    // Task terminale = feedback verrouillé
    if (["COMPLETED", "CANCELLED"].includes(task.status)) {
      return req.reject(
        409,
        "Mentor feedbacks cannot be modified after the task is completed or cancelled.",
      );
    }

    const intern = await SELECT.one
      .from(Interns)
      .columns("mentorAuthUserId")
      .where({ ID: task.intern_ID });

    if (!intern || intern.mentorAuthUserId !== req.user.id) {
      return req.reject(
        403,
        "You can only add feedback to tasks of interns you mentor.",
      );
    }
  };

  // Active entity
  this.before(["CREATE", "UPDATE"], MentorFeedbacks, validateMentorFeedback);

  // Draft entity
  this.before("CREATE", MentorFeedbacks.drafts, validateMentorFeedback);

  this.before("PATCH", MentorFeedbacks.drafts, validateMentorFeedback);

  this.after("CREATE", MentorFeedbacks, async (data, req) => {
    await writeAuditLog(req, {
      action: "CREATE_MENTOR_FEEDBACK",
      entityType: "MentorFeedback",
      entityID: data.ID,
      actorRole: "Mentor",
      description: `Mentor feedback created with rating ${data.rating}.`,
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

    const { Tasks } = cds.entities("intern.tasktracker");

    const task = await SELECT.one
      .from(Tasks)
      .columns("status")
      .where({ ID: taskId });

    if (!task) {
      return req.reject(404, "Task not found.");
    }

    if (task.status !== expectedStatus) {
      return req.reject(409, errorMessage);
    }

    await UPDATE(Tasks).set({ status: nextStatus }).where({ ID: taskId });

    await writeAuditLog(req, {
      action: auditAction,
      entityType: "Task",
      entityID: taskId,
      actorRole: "Mentor",
      description: `Task status changed from ${expectedStatus} to ${nextStatus}.`,
    });
  };

  this.on("completeTask", "Tasks", async (req) => {
    return transitionTask(
      req,
      "AWAITING_REVIEW",
      "COMPLETED",
      "Only tasks awaiting review can be completed.",
      "COMPLETE_TASK",
    );
  });

  this.on("requestChanges", "Tasks", async (req) => {
    return transitionTask(
      req,
      "AWAITING_REVIEW",
      "IN_PROGRESS",
      "Only tasks awaiting review can be sent back for changes.",
      "REQUEST_CHANGES",
    );
  });

  this.on("generateWeeklySummary", "Interns", async (req) => {
    const internId = req.params?.[0]?.ID;

    if (!internId) {
      return req.reject(400, "Intern ID is required.");
    }

    // 1. Récupérer l'intern
    const intern = await SELECT.one
      .from(Interns)
      .columns("ID", "firstName", "lastName", "department", "mentorAuthUserId")
      .where({ ID: internId });

    if (!intern) {
      return req.reject(404, "Intern not found.");
    }

    // 2. Vérifier que cet intern appartient bien au mentor connecté
    if (intern.mentorAuthUserId !== req.user.id) {
      return req.reject(
        403,
        "You can only generate summaries for interns you mentor.",
      );
    }

    // 3. Récupérer toutes les tâches de cet intern
    const tasks = await SELECT.from(Tasks).where({
      intern_ID: internId,
    });

    // 4. Récupérer les Progress Updates de ces tâches
    const taskIds = tasks.map((task) => task.ID);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    let progressUpdates = [];

    if (taskIds.length > 0) {
      progressUpdates = await SELECT.from(ProgressUpdates).where({
        task_ID: { in: taskIds },
        createdAt: { ">=": weekStart.toISOString() },
      });
    }

    const internData = {
      intern: {
        name: `${intern.firstName} ${intern.lastName}`,
        department: intern.department,
      },
      tasks: tasks.map((task) => ({
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
      })),
      progressUpdates: progressUpdates.map((update) => ({
        taskId: update.task_ID,
        progress: update.progress,
        blocker: update.blocker,
        comments: update.comments,
        createdAt: update.createdAt,
      })),
    };
    const prompt = `
    You are an internship progress assistant.

    Generate a weekly progress summary for the intern below.

    The summary is intended for the intern's mentor.

    Important rules:
    - Use only the information provided below.
    - Do not invent tasks, progress, blockers, deadlines, or achievements.
    - Progress updates provided are only from the last 7 days.
    - If there are no progress updates from the last 7 days, explicitly say so.
    - Keep the summary concise.
    - Do not use Markdown symbols such as #, *, ---, or tables.
    - Do not mention internal database IDs.
    - Use professional English.

    Use exactly these sections:

    Overall Progress:
    Briefly summarize the intern's current situation.

    Progress This Week:
    Describe meaningful progress reported during the last 7 days.

    Blockers and Risks:
    Mention blockers, overdue tasks, or important risks. If none exist, say so.

    Tasks Requiring Attention:
    Mention blocked tasks, tasks awaiting review, or important upcoming deadlines.

    Recommended Next Steps:
    Give at most 3 short recommendations.

    Intern data:
    ${JSON.stringify(internData, null, 2)}
    `;
    try {
      const summary = await geminiClient.generateWeeklySummary(prompt);

      await writeAuditLog(req, {
        action: "GENERATE_WEEKLY_SUMMARY",
        entityType: "Intern",
        entityID: internId,
        actorRole: "Mentor",
        description: `Weekly progress summary generated for ${intern.firstName} ${intern.lastName}.`,
      });

      return summary;
    } catch (error) {
      console.error(
        "Gemini summary generation failed:",
        error?.status ?? error?.code,
      );

      return req.reject(
        503,
        "AI summary service is temporarily unavailable. Please try again later.",
      );
    }
  });

  this.on("READ", "MentorDashboardKPIs", async (req) => {
    const today = new Date().toISOString().slice(0, 10);

    // -------------------------
    // INTERNS DU MENTOR CONNECTÉ
    // -------------------------
    const mentorInterns = await SELECT.from(Interns).where({
      mentorAuthUserId: req.user.id,
    });

    const assignedInterns = mentorInterns.length;

    // IDs des interns du mentor
    const internIds = new Set(mentorInterns.map((intern) => intern.ID));

    // -------------------------
    // TASKS
    // -------------------------

    const allTasks = await SELECT.from(Tasks);

    // On garde uniquement les tâches
    // des interns suivis par ce mentor
    const tasks = allTasks.filter((task) => internIds.has(task.intern_ID));

    // -------------------------
    // TOTAL
    // -------------------------
    const totalTasks = tasks.length;

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

    // Les tâches annulées ne comptent pas
    // dans le dénominateur.
    const activeTasks = tasks.filter((task) => task.status !== "CANCELLED");

    const completionRate =
      activeTasks.length === 0
        ? 0
        : Number(((completedTasks / activeTasks.length) * 100).toFixed(2));

    // -------------------------
    // RESPONSE
    // -------------------------
    return {
      ID: "mentor-dashboard",
      assignedInterns,
      totalTasks,
      inProgressTasks,
      awaitingReviewTasks,
      blockedTasks,
      overdueTasks,
      completedTasks,
      cancelledTasks,
      completionRate,
    };
  });

  this.on("READ", "MentorInternPerformance", async (req) => {
    const today = new Date().toISOString().slice(0, 10);

    const mentorInterns = await SELECT.from(Interns).where({
      mentorAuthUserId: req.user.id,
    });

    const allTasks = await SELECT.from(Tasks);

    return mentorInterns.map((intern) => {
      const internTasks = allTasks.filter(
        (task) => task.intern_ID === intern.ID,
      );

      const inProgressTasks = internTasks.filter(
        (task) => task.status === "IN_PROGRESS",
      ).length;

      const awaitingReviewTasks = internTasks.filter(
        (task) => task.status === "AWAITING_REVIEW",
      ).length;

      const blockedTasks = internTasks.filter(
        (task) => task.status === "BLOCKED",
      ).length;

      const completedTasks = internTasks.filter(
        (task) => task.status === "COMPLETED",
      ).length;

      const overdueTasks = internTasks.filter((task) => {
        return (
          task.dueDate &&
          task.dueDate < today &&
          task.status !== "COMPLETED" &&
          task.status !== "CANCELLED"
        );
      }).length;

      const activeTasks = internTasks.filter(
        (task) => task.status !== "CANCELLED",
      );

      const completionRate =
        activeTasks.length === 0
          ? 0
          : Number(((completedTasks / activeTasks.length) * 100).toFixed(2));

      return {
        internID: intern.ID,
        internName: `${intern.firstName} ${intern.lastName}`,
        department: intern.department,

        totalTasks: internTasks.length,
        inProgressTasks,
        awaitingReviewTasks,
        blockedTasks,
        overdueTasks,
        completedTasks,
        completionRate,
      };
    });
  });
});
