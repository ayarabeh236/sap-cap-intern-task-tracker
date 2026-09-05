using { intern.tasktracker as db } from '../db/schema';

service InternshipService {

    entity Interns
        as projection on db.Interns;

    entity Tasks
        as projection on db.Tasks;

    entity ProgressUpdates
        as projection on db.ProgressUpdates;

    entity MentorFeedbacks
        as projection on db.MentorFeedbacks;
}