sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"intern/tasktracker/manager/test/integration/pages/TasksList.gen",
	"intern/tasktracker/manager/test/integration/pages/TasksObjectPage.gen"
], function (JourneyRunner, TasksListGenerated, TasksObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('intern/tasktracker/manager') + '/test/flp.html#app-preview',
        pages: {
			onTheTasksListGenerated: TasksListGenerated,
			onTheTasksObjectPageGenerated: TasksObjectPageGenerated
        },
        async: true
    });

    return runner;
});

