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
            Label: 'Status'
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
                Label: 'Status'
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
    ]
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

annotate service.Tasks with {
    status    @Common.Label: 'Status';
    priority  @Common.Label: 'Priority';
    
};

annotate service.Tasks:intern.ID with @title: 'Intern';

annotate service.Tasks:intern.ID with @(
    Common.Text: intern.fullName,
    Common.Text.@UI.TextArrangement: #TextOnly
);

annotate service.Interns:ID with @(
    Common.Text: fullName,
    Common.Text.@UI.TextArrangement: #TextOnly
);

annotate service.Tasks with @(
    UI.Identification: [
        {
            $Type: 'UI.DataFieldForAction',
            Action: 'InternshipService.completeTask',
            Label: 'Complete Task'
        }
    ]
);