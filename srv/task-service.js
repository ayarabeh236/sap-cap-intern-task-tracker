import cds from '@sap/cds';

export default cds.service.impl(function () {

    this.before('CREATE', 'Tasks', (req) => {
        const { dueDate } = req.data;

        if (!dueDate) {
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const taskDueDate = new Date(dueDate);

        if (taskDueDate < today) {
            req.error(400, 'Due date cannot be in the past.', 'dueDate');
        }
    });

});