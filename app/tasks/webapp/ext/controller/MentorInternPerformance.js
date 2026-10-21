sap.ui.define(
  [
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/BusyDialog",
    "sap/m/MessageBox",
  ],
  function (Dialog, Text, Button, BusyDialog, MessageBox) {
    "use strict";

    return {
      onGenerateWeeklySummary: async function (oContext, aSelectedContexts) {
        if (!aSelectedContexts || aSelectedContexts.length === 0) {
          MessageBox.warning("Please select an intern.");
          return;
        }

        const selectedIntern = aSelectedContexts[0].getObject();
        const internId = selectedIntern.internID;

        const oModel = aSelectedContexts[0].getModel();

        const oBusyDialog = new BusyDialog({
          title: "Generating Summary",
          text: "Gemini is analyzing the intern's weekly progress...",
        });

        try {
          oBusyDialog.open();

          const oAction = oModel.bindContext(
            `/Interns(${internId})/InternshipService.generateWeeklySummary(...)`,
          );

          await oAction.execute();

          const oResultContext = oAction.getBoundContext();
          const summary = oResultContext.getProperty("value");

          const oDialog = new Dialog({
            title: `Weekly Progress Summary - ${selectedIntern.internName}`,
            contentWidth: "700px",
            resizable: true,
            draggable: true,

            content: [
              new Text({
                text: summary,
                wrapping: true,
                renderWhitespace: true,
              }).addStyleClass("sapUiSmallMargin"),
            ],

            endButton: new Button({
              text: "Close",
              press: function () {
                oDialog.close();
              },
            }),

            afterClose: function () {
              oDialog.destroy();
            },
          });

          oDialog.open();
        } catch (error) {
          console.error("Weekly summary generation failed:", error);

          MessageBox.error(
            "The weekly progress summary could not be generated. Please try again.",
          );
        } finally {
          oBusyDialog.close();
          oBusyDialog.destroy();
        }
      },
    };
  },
);
