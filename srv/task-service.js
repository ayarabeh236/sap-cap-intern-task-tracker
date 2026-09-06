import cds from '@sap/cds';

export default cds.service.impl(function () {

    const validateDueDate = (req) => {
        const { dueDate } = req.data;

        if (!dueDate) {
            return;
        }

        const due = new Date(`${dueDate}T00:00:00`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (due < today) {
            req.error(
                400,
                'Due date cannot be in the past.',
                'dueDate'
            );
        }
    };

    this.before(
        ['CREATE', 'UPDATE'],
        'Tasks',
        validateDueDate
    );


    this.on('completeTask', 'Tasks', async (req) => {
        const task = req.params[0];

        const { Tasks } = cds.entities('intern.tasktracker');

        await UPDATE(Tasks)
            .set({ status: 'COMPLETED' })
            .where({ ID: task.ID });
    });

});