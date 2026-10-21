sap.ui.define([], function () {
  "use strict";

  return {
    onInternPerformance: function () {
      this.getRouting().navigateToRoute("MentorInternPerformance");
    },
  };
});
