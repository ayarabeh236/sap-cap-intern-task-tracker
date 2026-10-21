using InternService as service from '../../srv/intern-service';

annotate service.MyTasks with @(
    UI.SelectionFields: [
        status,
        priority
    ],

    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Value: title,
            Label: 'Title'
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
    ],
    UI.HeaderInfo: {
        TypeName: 'Task',
        TypeNamePlural: 'Tasks',
        Title: {
            $Type: 'UI.DataField',
            Value: title
        }
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

    UI.Identification: [
        {
            $Type: 'UI.DataFieldForAction',
            Action: 'InternService.startTask',
            Label: 'Start Task'
        },
        {
            $Type: 'UI.DataFieldForAction',
            Action: 'InternService.blockTask',
            Label: 'Block Task'
        },
        {
            $Type: 'UI.DataFieldForAction',
            Action: 'InternService.resumeTask',
            Label: 'Resume Task'
        },
        {
            $Type: 'UI.DataFieldForAction',
            Action: 'InternService.submitForReview',
            Label: 'Submit for Review'
        }
    ],

    UI.UpdateHidden: (
        status = 'COMPLETED' OR status = 'CANCELLED' OR status = 'AWAITING_REVIEW'
    )

   
    

);

annotate service.MyProgressUpdates with @(
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
            Value: modifiedAt,
            Label: 'Updated At'
        }
    ]
);

annotate service.MyMentorFeedbacks with @(
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

annotate service.MyTasks:status with @(
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
            
        ]
    }
);

annotate service.MyTasks:priority with @(
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





