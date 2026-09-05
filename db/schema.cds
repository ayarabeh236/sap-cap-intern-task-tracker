using { cuid, managed } from '@sap/cds/common';

namespace intern.tasktracker;

type TaskPriority : String(20) enum {
    LOW;
    MEDIUM;
    HIGH;
}

type TaskStatus : String(30) enum {
    OPEN;
    IN_PROGRESS;
    BLOCKED;
    COMPLETED;
}


entity Interns : cuid, managed {
    firstName   : String(80);
    lastName    : String(80);
    email       : String(120);
    department  : String(100);

    mentorName  : String(120);
    mentorEmail : String(120);

    tasks : Composition of many Tasks
        on tasks.intern = $self;
}


entity Tasks : cuid, managed {
    title       : String(150);
    description : LargeString;

    priority : TaskPriority;
    status   : TaskStatus default 'OPEN';
    dueDate  : Date;

    intern : Association to Interns;

    progressUpdates : Composition of many ProgressUpdates
        on progressUpdates.task = $self;

    feedbacks : Composition of many MentorFeedbacks
        on feedbacks.task = $self;
}


entity ProgressUpdates : cuid, managed {
    progress : Integer;
    blocker  : Boolean default false;
    comments : LargeString;

    task : Association to Tasks;
}


entity MentorFeedbacks : cuid, managed {
    rating          : Integer;
    recommendations : LargeString;

    task : Association to Tasks;
}