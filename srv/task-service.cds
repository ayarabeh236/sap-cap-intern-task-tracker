using { intern.tasktracker as db } from '../db/schema';

@requires: 'Mentor'
service InternshipService {

    entity Interns
        as projection on db.Interns
        actions {

            action generateWeeklySummary(_it: $self)
                returns LargeString;
        };
    

   @odata.draft.enabled
   entity Tasks
       as projection on db.Tasks
       actions {

           @(
               Core.OperationAvailable: (
                   :_it.status = 'AWAITING_REVIEW'
               ),
               Common.SideEffects: {
                   TargetProperties: ['_it/status']
               }
            )
            action completeTask(_it: $self);


            @(
                Core.OperationAvailable: (
                    :_it.status = 'AWAITING_REVIEW'
                ),
                Common.SideEffects: {
                    TargetProperties: ['_it/status']
                }
            )
            action requestChanges(_it: $self);
        };
     
    annotate InternshipService.Tasks with @restrict: [
        
        {
            grant: [
                'READ',  
                'UPDATE',
                'completeTask',
                'requestChanges'
             ],
            to: 'Mentor',
            where: 'intern.mentorAuthUserId = $user'
        },
        {
            grant: 'CREATE',
            to: 'Mentor'
        },

    
       
    ];

    



    entity ProgressUpdates
        as projection on db.ProgressUpdates;


    annotate InternshipService.ProgressUpdates with @restrict: [
       
        {
            grant: 'READ',
            to: 'Mentor',
            where: 'task.intern.mentorAuthUserId = $user'
         },
       
    ];

    annotate InternshipService.ProgressUpdates with @(
        Capabilities.InsertRestrictions.Insertable: false,
        Capabilities.UpdateRestrictions.Updatable: false,
        Capabilities.DeleteRestrictions.Deletable: false
    );

    
    

    entity MentorFeedbacks
        as projection on db.MentorFeedbacks;

    annotate InternshipService.MentorFeedbacks with @restrict: [
       
        {
            grant: ['READ', 'CREATE', 'UPDATE'],
            to: 'Mentor',
            where: 'task.intern.mentorAuthUserId = $user'
        },
       
    ];

    annotate InternshipService.MentorFeedbacks with @(
        Capabilities.DeleteRestrictions.Deletable: false
    );

    entity TaskStatuses
        as projection on db.TaskStatuses;

    entity TaskPriorities
        as projection on db.TaskPriorities;

    @odata.singleton
    @cds.persistence.skip
    @readonly
    entity MentorDashboardKPIs {
        key ID : String(20);
  
        assignedInterns      : Integer;
        totalTasks           : Integer;
        inProgressTasks      : Integer;
        awaitingReviewTasks  : Integer;
        blockedTasks         : Integer;
        overdueTasks         : Integer;
        completedTasks       : Integer;
        cancelledTasks       : Integer;

        completionRate       : Decimal(5,2);
    
    };


    @readonly
    entity MentorInternPerformance {
        key internID          : UUID;
        internName            : String;
        department            : String;

        totalTasks            : Integer;
        inProgressTasks       : Integer;
        awaitingReviewTasks   : Integer;
        blockedTasks          : Integer;
        overdueTasks          : Integer;
        completedTasks        : Integer;

        completionRate        : Decimal(5,2);
    }
}

annotate InternshipService.Tasks with {
    status @readonly;
};

annotate InternshipService.Tasks with @(
    Capabilities.DeleteRestrictions.Deletable: false
);

annotate InternshipService.Interns with @restrict: [
    
    {
        grant: ['READ', 'generateWeeklySummary'],
        to: 'Mentor',
        where: 'mentorAuthUserId = $user'
    },
    
];


