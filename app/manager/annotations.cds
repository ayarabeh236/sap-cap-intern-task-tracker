using ManagerService as service from '../../srv/manager-service';
annotate service.Tasks with @(

    UI.SelectionFields: [
        intern_ID,
        status,
        priority
    ],

    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'title',
                Value : title,
            },

            {
                $Type : 'UI.DataField',
                Label : 'Intern',
                Value : intern_ID,
            },
            {
                $Type : 'UI.DataField',
                Label : 'description',
                Value : description,
            },
            {
                $Type : 'UI.DataField',
                Label : 'priority',
                Value : priority,
            },
            {
                $Type : 'UI.DataField',
                Label : 'status',
                Value : status,
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
                $Type : 'UI.DataField',
                Label : 'dueDate',
                Value : dueDate,
            },
        ],
    },

    UI.HeaderInfo : {
        TypeName : 'Task',
        TypeNamePlural : 'Tasks',
        Title : {
            $Type : 'UI.DataField',
            Value : title,
        },
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },

        {
            $Type : 'UI.ReferenceFacet',
            ID : 'ProgressUpdatesFacet',
            Label : 'Progress Updates',
            Target : 'progressUpdates/@UI.LineItem',
        },


        {
            $Type : 'UI.ReferenceFacet',
            ID : 'MentorFeedbacksFacet',
            Label : 'Mentor Feedbacks',
            Target : 'feedbacks/@UI.LineItem',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'title',
            Value : title,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Intern',
            Value : intern.fullName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'priority',
            Value : priority,
        },
        {
            $Type : 'UI.DataField',
            Label : 'status',
            Value : status,
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
            $Type : 'UI.DataField',
            Label : 'dueDate',
            Value : dueDate,
        },
    ],
);



annotate service.Tasks:intern with @(
    Common.Label : 'Intern',
    Common.Text : intern.fullName,
    Common.Text.@UI.TextArrangement : #TextOnly,
    Common.ValueList : {
        Label : 'Intern',
        CollectionPath : 'Interns',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : intern_ID,
                ValueListProperty : 'ID',
            },
    
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'fullName',
            },
            
        ],
    }
);

annotate service.Interns with {
    ID @UI.Hidden : true;
};

annotate service.ProgressUpdates with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Progress (%)',
            Value : progress,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Blocker',
            Value : blocker,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Comments',
            Value : comments,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Created At',
            Value : createdAt,
        },
    ],
);

annotate service.MentorFeedbacks with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Rating',
            Value : rating,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Recommendations',
            Value : recommendations,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Created At',
            Value : createdAt,
        },
    ],
);

annotate service.Tasks with {
    status @readonly;
    intern @Core.Immutable;
};

annotate service.Tasks:status with @(
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

annotate service.Tasks with @(
    UI.Identification: [
        {
            $Type: 'UI.DataFieldForAction',
            Action: 'ManagerService.cancelTask',
            Label: 'Cancel Task'
        }
    ]
);
annotate service.Tasks:priority with @(
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
annotate service.TaskStatuses:code with @(
    Common.Text: label,
    Common.Text.@UI.TextArrangement: #TextOnly
);

annotate service.TaskPriorities:code with @(
    Common.Text: label,
    Common.Text.@UI.TextArrangement: #TextOnly
);

annotate service.DashboardKPIsByIntern with @(
    UI.SelectionFields: [
        internID
    ],

    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Value: internName,
            Label: 'Intern'
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


   annotate ManagerService.DashboardKPIsByIntern with {
    internID @(
        Common.Text: intern.fullName,
        Common.Text.@UI.TextArrangement: #TextOnly,

        Common.ValueList: {
            Label: 'Intern',
            CollectionPath: 'Interns',
            Parameters: [
                {
                    $Type: 'Common.ValueListParameterInOut',
                    LocalDataProperty: internID,
                    ValueListProperty: 'ID'
                },
                {
                    $Type: 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'fullName'
                }
            ]
        }
    );
};
