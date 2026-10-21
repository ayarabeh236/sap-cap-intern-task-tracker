sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"intern/tasktracker/mytasks/test/integration/pages/MyTasksList.gen",
	"intern/tasktracker/mytasks/test/integration/pages/MyTasksObjectPage.gen"
], function (JourneyRunner, MyTasksListGenerated, MyTasksObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('intern/tasktracker/mytasks') + '/test/flp.html#app-preview',
        pages: {
			onTheMyTasksListGenerated: MyTasksListGenerated,
			onTheMyTasksObjectPageGenerated: MyTasksObjectPageGenerated
        },
        async: true
    });

    return runner;
});

