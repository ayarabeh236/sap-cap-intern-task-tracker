using { InternService } from './intern-service';

annotate InternService.MyProgressUpdates with {
    progress @mandatory
             @assert.range: [0, 100];
};