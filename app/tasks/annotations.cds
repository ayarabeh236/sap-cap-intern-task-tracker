using InternshipService as service from '../../srv/task-service';

annotate service.Tasks with @(
    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Value: title,
            Label: 'Title'
        },
        {
            $Type: 'UI.DataField',
            Value: intern.fullName,
            Label: 'Intern'
        },
        {
            $Type: 'UI.DataField',
            Value: priority,
            Label: 'Priority'
        },
        {
            $Type: 'UI.DataField',
            Value: status,
            Label: 'Status',
            Criticality: (
                status = 'COMPLETED'
                    ? 3
                    : (
                        status = 'AWAITING_REVIEW'
                            ? 2
                            : (
                                status = 'BLOCKED' OR status = 'CANCELLED'
                                    ? 1
                                    : 0
                            )
                    )
            )
        },
        {
            $Type: 'UI.DataField',
            Value: dueDate,
            Label: 'Due Date'
        }
    ]
);

annotate service.Tasks with @(
    UI.HeaderInfo: {
        TypeName: 'Task',
        TypeNamePlural: 'Tasks',
        Title: {
            $Type: 'UI.DataField',
            Value: title
        },
        Description: {
            $Type: 'UI.DataField',
            Value: intern.fullName
        }
    },

    UI.Identification: [
        {
            $Type: 'UI.DataFieldForAction',
            Action: 'InternshipService.completeTask',
            Label: 'Complete Task'
        },
        {
            $Type: 'UI.DataFieldForAction',
            Action: 'InternshipService.requestChanges',
            Label: 'Request Changes'
        }
    ],

    UI.FieldGroup #GeneralInformation: {
        Data: [
            {
                $Type: 'UI.DataField',
                Value: title,
                Label: 'Title'
            },
            {
                $Type: 'UI.DataField',
                Value: description,
                Label: 'Description'
            },
            {
                $Type: 'UI.DataField',
                Value: intern_ID,
                Label: 'Intern'
            },
            {
                $Type: 'UI.DataField',
                Value: priority,
                Label: 'Priority'
            },
            {
                $Type: 'UI.DataField',
                Value: status,
                Label: 'Status',
                Criticality: (
                status = 'COMPLETED'
                    ? 3
                    : (
                        status = 'AWAITING_REVIEW'
                            ? 2
                            : (
                                status = 'BLOCKED' OR status = 'CANCELLED'
                                    ? 1
                                    : 0
                            )
                    )
            )
            },
            {
                $Type: 'UI.DataField',
                Value: dueDate,
                Label: 'Due Date'
            }
        ]
    },

    UI.Facets: [
        {
            $Type: 'UI.ReferenceFacet',
            Label: 'General Information',
            Target: '@UI.FieldGroup#GeneralInformation'
        },

        {
            $Type: 'UI.ReferenceFacet',
            Label: 'Progress Updates',
            Target: 'progressUpdates/@UI.LineItem'
        },


        {
            $Type: 'UI.ReferenceFacet',
            Label: 'Mentor Feedback',
            Target: 'feedbacks/@UI.LineItem'
        }


        
    ],

    UI.UpdateHidden: (
        status = 'COMPLETED' OR status = 'CANCELLED'
    )
);

annotate service.ProgressUpdates with @(
    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Value: progress,
            Label: 'Progress'
        },
        {
            $Type: 'UI.DataField',
            Value: blocker,
            Label: 'Blocker'
        },
        {
            $Type: 'UI.DataField',
            Value: comments,
            Label: 'Comments'
        },
        {
            $Type: 'UI.DataField',
            Value: createdAt,
            Label: 'Updated At'
        }
    ]
);

annotate service.MentorFeedbacks with @(
    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Value: rating,
            Label: 'Rating'
        },

        
        {
            $Type: 'UI.DataField',
            Value: recommendations,
            Label: 'Recommendations'
        },
        {
            $Type: 'UI.DataField',
            Value: createdAt,
            Label: 'Created At'
        }

    ]
);


annotate service.Tasks:intern with @(
    Common: {
        Text: intern.fullName,
        TextArrangement: #TextOnly,

        ValueList: {
            Label: 'Intern',
            CollectionPath: 'Interns',

            Parameters: [
                {
                    $Type: 'Common.ValueListParameterInOut',
                    LocalDataProperty: intern_ID,
                    ValueListProperty: 'ID'
                },
                {
                    $Type: 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'fullName'
                }
            ]
        }
    }
);
annotate service.Interns with {
    ID @UI.Hidden;
    fullName @Common.Label: 'Intern';
};

annotate service.Tasks with @(
    UI.SelectionFields: [
        status,
        priority,
        intern_ID
    ]
);



annotate service.Tasks:intern.ID with @title: 'Intern';

annotate service.Tasks:intern.ID with @(
    Common.Text: intern.fullName,
    Common.Text.@UI.TextArrangement: #TextOnly
);

annotate service.Interns:ID with @(
    Common.Text: fullName,
    Common.Text.@UI.TextArrangement: #TextOnly
);


annotate service.Tasks with {

    status @(
        Common.Label: 'Status',
        Common.Text: statusValue.label,
        Common.Text.@UI.TextArrangement: #TextOnly,

        Common.ValueListWithFixedValues: true,

        Common.ValueList: {
            Label: 'Status',
            CollectionPath: 'TaskStatuses',

            Parameters: [
                {
                    $Type: 'Common.ValueListParameterInOut',
                    LocalDataProperty: status,
                    ValueListProperty: 'code'
                },
                {
                    $Type: 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'label'
                }
            ]
        }
    );


    priority @(
        Common.Label: 'Priority',
        Common.Text: priorityValue.label,
        Common.Text.@UI.TextArrangement: #TextOnly,

        Common.ValueListWithFixedValues: true,

        Common.ValueList: {
            Label: 'Priority',
            CollectionPath: 'TaskPriorities',

            Parameters: [
                {
                    $Type: 'Common.ValueListParameterInOut',
                    LocalDataProperty: priority,
                    ValueListProperty: 'code'
                },
                {
                    $Type: 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'label'
                }
            ]
        }
    );

};

annotate service.TaskStatuses:code with @(
    Common.Text: label,
    Common.Text.@UI.TextArrangement: #TextOnly
);

annotate service.TaskPriorities:code with @(
    Common.Text: label,
    Common.Text.@UI.TextArrangement: #TextOnly
);




annotate service.Tasks with {
    intern @(
        Common.FieldControl: {
            $edmJson: {
                $If: [
                    {
                        $Eq: [
                            {
                                $Path: 'HasActiveEntity'
                            },
                            true
                        ]
                    },
                    1,
                    3
                ]
            }
        }
    );
};


annotate InternshipService.MentorInternPerformance with @(
    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Value: internName,
            Label: 'Intern'
        },
        {
            $Type: 'UI.DataField',
            Value: department,
            Label: 'Department'
        },
        {
            $Type: 'UI.DataField',
            Value: totalTasks,
            Label: 'Total Tasks'
        },
        {
            $Type: 'UI.DataField',
            Value: inProgressTasks,
            Label: 'In Progress',
            Criticality: #Information
        },
        {
            $Type: 'UI.DataField',
            Value: awaitingReviewTasks,
            Label: 'Awaiting Review',
            Criticality: #Critical
        },
        {
            $Type: 'UI.DataField',
            Value: blockedTasks,
            Label: 'Blocked',
            Criticality: #Negative
        },
        {
            $Type: 'UI.DataField',
            Value: overdueTasks,
            Label: 'Overdue',
            Criticality: #Negative
        },
        {
            $Type: 'UI.DataField',
            Value: completedTasks,
            Label: 'Completed',
            Criticality: #Positive
        },
        {
            $Type: 'UI.DataField',
            Value: completionRate,
            Label: 'Completion Rate',
            Criticality: #Positive
        }
    ]
);