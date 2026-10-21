using { intern.tasktracker as db } from '../db/schema';

@requires: 'Manager'
service ManagerService {

    @odata.draft.enabled
    entity Tasks
        as projection on db.Tasks
        actions {
            @(
                cds.odata.bindingparameter.name: '_it',
                Common.SideEffects: {
                    TargetProperties: ['_it/status']
                }
            )
            @requires: 'Manager'
            action cancelTask();
        };


    annotate ManagerService.Tasks with @restrict: [
        {
            grant: ['READ', 'CREATE', 'UPDATE', 'cancelTask'],
            to: 'Manager'
        }
    ];

  

    annotate ManagerService.Tasks with @(
        Capabilities.DeleteRestrictions.Deletable: false
    );

  


    entity Interns
        as projection on db.Interns;

    annotate ManagerService.Interns with @restrict: [
        {
            grant: 'READ',
            to: 'Manager'
        }
    ];

    annotate ManagerService.Interns with {
          ID @Common: {
             Text: fullName,
             TextArrangement: #TextOnly
           };
    };


    entity ProgressUpdates
        as projection on db.ProgressUpdates;

    annotate ManagerService.ProgressUpdates with @restrict: [
        {
            grant: 'READ',
            to: 'Manager'
        }
    ];

    annotate ManagerService.ProgressUpdates with @(
        Capabilities.InsertRestrictions.Insertable: false,
        Capabilities.UpdateRestrictions.Updatable: false,
        Capabilities.DeleteRestrictions.Deletable: false
    );


    entity MentorFeedbacks
        as projection on db.MentorFeedbacks;

    annotate ManagerService.MentorFeedbacks with @restrict: [
        {
            grant: 'READ',
            to: 'Manager'
        }
    ];

    annotate ManagerService.MentorFeedbacks with @(
        Capabilities.InsertRestrictions.Insertable: false,
        Capabilities.UpdateRestrictions.Updatable: false,
        Capabilities.DeleteRestrictions.Deletable: false
    );

    @readonly
    entity AuditLogs
        as projection on db.AuditLogs;

    annotate ManagerService.AuditLogs with @restrict: [
        {
            grant: 'READ',
            to: 'Manager'
        }
    ];


    entity TaskStatuses
        as projection on db.TaskStatuses;

    entity TaskPriorities
        as projection on db.TaskPriorities;



    @odata.singleton
    @cds.persistence.skip
    @readonly
    entity DashboardKPIs {
        key ID : String(20);

        totalTasks          : Integer;
        openTasks           : Integer;
        inProgressTasks     : Integer;
        awaitingReviewTasks : Integer;
        blockedTasks        : Integer;
        overdueTasks        : Integer;
        completedTasks      : Integer;
        cancelledTasks      : Integer;

        completionRate      : Decimal(5,2);
    };   

    @readonly
    entity DashboardKPIsByIntern {
        key internID          : UUID;
          
        intern                : Association to Interns
                                on intern.ID = internID;
        internName            : String;                        
        totalTasks            : Integer;
        openTasks             : Integer;
        inProgressTasks       : Integer;
        awaitingReviewTasks   : Integer;
        blockedTasks          : Integer;
        overdueTasks          : Integer;
        completedTasks        : Integer;
        cancelledTasks        : Integer;
        completionRate        : Decimal(5,2);
    }

    annotate ManagerService.DashboardKPIsByIntern with {
        internID @Common: {
            Text: intern.fullName,
            TextArrangement: #TextOnly
        };
    };

    
 

        
}