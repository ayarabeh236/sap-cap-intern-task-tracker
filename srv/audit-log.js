import cds from "@sap/cds";

const { AuditLogs } = cds.entities("intern.tasktracker");

export const writeAuditLog = async (
  req,
  { action, entityType, entityID, actorRole, description },
) => {
  await cds.tx(req).run(
    INSERT.into(AuditLogs).entries({
      action,
      entityType,
      entityID,
      actorRole,
      description,
    }),
  );
};
