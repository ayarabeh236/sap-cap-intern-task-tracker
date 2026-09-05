using { InternshipService } from './task-service';

annotate InternshipService.ProgressUpdates with {
    progress @assert.range: [0, 100];
};