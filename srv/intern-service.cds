using { intern.tasktracker as db } from '../db/schema';

@requires: 'Intern'
service InternService {

    @odata.draft.enabled
    entity MyTasks
        as projection on db.Tasks
        actions {

            @(
                Core.OperationAvailable: (
                    :_it.status = 'OPEN'
                ),
                Common.SideEffects: {
                    TargetProperties: ['_it/status']
                }
            ) 
            action startTask(_it: $self);


            @(
                Core.OperationAvailable: (
                    :_it.status = 'IN_PROGRESS'
                ),
                Common.SideEffects: {
                    TargetProperties: ['_it/status']
                }
            )
            action blockTask(_it: $self);


            @(
                 Core.OperationAvailable: (
                     :_it.status = 'BLOCKED'
                 ),
                 Common.SideEffects: {
                     TargetProperties: ['_it/status']
                 }
            )
            action resumeTask(_it: $self);


            @(
                Core.OperationAvailable: (
                     :_it.status = 'IN_PROGRESS'
                ),
                Common.SideEffects: {
                    TargetProperties: ['_it/status']
                }
            )
            action submitForReview(_it: $self);
        };

    annotate MyTasks with @restrict: [
        {
            grant: [
                'READ',
                'UPDATE',
                'startTask',
                'blockTask',
                'resumeTask',
                'submitForReview'
            ],
            to: 'Intern',
            where: 'intern.authUserId = $user'
        }
    ];


    entity MyProgressUpdates
        as projection on db.ProgressUpdates;

    

    entity MyMentorFeedbacks
        as projection on db.MentorFeedbacks;

    annotate MyMentorFeedbacks with @restrict: [
        {
            grant: 'READ',
            to: 'Intern',
            where: 'task.intern.authUserId = $user'
        }
    ];


    entity TaskStatuses
        as projection on db.TaskStatuses;

    entity TaskPriorities
        as projection on db.TaskPriorities;

   

}


 annotate InternService.MyTasks with {
        title       @readonly;
        description @readonly;
        priority    @readonly;
        dueDate     @readonly;
        intern      @readonly;
        status      @readonly;
    };

annotate InternService.MyTasks with @(
    Capabilities.InsertRestrictions.Insertable: false,
    Capabilities.DeleteRestrictions.Deletable: false,

  
);


annotate InternService.MyProgressUpdates with @restrict: [
    {
        grant: ['READ', 'CREATE', 'UPDATE'],
        to: 'Intern',
        where: 'task.intern.authUserId = $user'
    }
];

annotate InternService.MyProgressUpdates with @(
    Capabilities.DeleteRestrictions.Deletable: false
);

annotate InternService.MyMentorFeedbacks with @(
    Capabilities.InsertRestrictions.Insertable: false,
    Capabilities.UpdateRestrictions.Updatable: false,
    Capabilities.DeleteRestrictions.Deletable: false
);