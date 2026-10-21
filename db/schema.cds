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
    AWAITING_REVIEW;
    COMPLETED;
    CANCELLED;
}


entity Interns : cuid, managed {
    firstName   : String(80);
    lastName    : String(80);
    fullName    : String(161) = firstName || ' ' || lastName;
    email       : String(120);
    department  : String(100);
    authUserId : String(100);
    mentorAuthUserId : String(100);

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
    
    statusValue : Association to TaskStatuses
        on statusValue.code = $self.status;

    priorityValue : Association to TaskPriorities
        on priorityValue.code = $self.priority;
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


entity TaskStatuses {
    key code : String(30);
    label    : String(50);
}

entity TaskPriorities {
    key code : String(20);
    label    : String(50);
}


entity AuditLogs : cuid, managed {
    action      : String(50);
    entityType  : String(50);
    entityID    : String(100);
    actorRole   : String(30);
    description : LargeString;
}