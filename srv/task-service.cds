using { intern.tasktracker as db } from '../db/schema';

service InternshipService {

    entity Interns
        as projection on db.Interns;
    

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
         action completeTask();
     };

    
    entity ProgressUpdates
        as projection on db.ProgressUpdates;

    entity MentorFeedbacks
        as projection on db.MentorFeedbacks;
}