import { useShepherd } from "vue-shepherd";
import { useMainStore } from "../store";

const _classPrefix = "app-tour";
const _btnClass =
  "q-btn q-btn-item non-selectable no-outline q-btn--flat q-btn--rectangle text-primary q-btn--actionable q-focusable q-hoverable q-btn--no-uppercase q-btn--dense";

  const _btnSkip =
  "btn-tour-skip q-btn q-btn-item non-selectable no-outline q-btn--flat q-btn--rectangle text-primary q-btn--actionable q-focusable q-hoverable q-btn--no-uppercase q-btn--dense q-mr-lg";

export function resetTourCookies(q) {
    return new Promise((resolve) => {
        if (q){
            q.cookies.remove("xmap_apptour_home");
            q.cookies.remove("xmap_apptour_dashboard");
        }
        resolve();
    });
}

export function noTours(q, val){
  if (val){
    q.cookies.set("xmap_notours", "1", { expires: 360 });
  }else{
    q.cookies.remove("xmap_notours");
  }
}

export function useHomeTour(userInfo, q) {
  const mainStore = useMainStore();
  const tour = useShepherd({
    classPrefix: _classPrefix,
    useModalOverlay: true,
  });

  tour.on("cancel", () => {
    q.cookies.set("xmap_apptour_home", "0", { expires: 360 });
    mainStore.SetAdHocTour(false);
  });

  tour.on("complete", () => {
    q.cookies.set("xmap_apptour_home", "1", { expires: 360 });
    mainStore.SetAdHocTour(false);
  });

  // tour.addStep({
  //   title: "Getting Started",
  //   text: "Take a quick guided tour to get familiar with XMAP",
  //   classes: "example-step-extra-class",
  //   buttons: [
  //     {
  //       text: "No, thanks",
  //       action: tour.cancel,
  //       classes: _btnClass,
  //     },
  //     {
  //       text: "OK, let's start!",
  //       action: tour.next,
  //       classes: _btnClass,
  //     },
  //   ],
  // });

  tour.addStep({
    attachTo: { element: ".dashboard-item", on: "top" },
    title: "Reports",
    text:
      "Click on the dashboard tiles to view report details. Each user is assigned with dashboards according to their function.",
    classes: "example-step-extra-class",
    buttons: [
      {
        text: "Cancel Tour",
        action: tour.cancel,
        classes: _btnSkip,
      },
      {
        text: "Back",
        action: tour.back,
        classes: _btnClass,
      },
      {
        text: "Next",
        action: tour.next,
        classes: _btnClass,
      },
    ],
  });

  tour.addStep({
    attachTo: { element: ".home-search", on: "top" },
    title: "Search",
    text:
      "Filter available dashboards using dashboard title.",
    classes: "example-step-extra-class",
    buttons: [
      {
        text: "Cancel Tour",
        action: tour.cancel,
        classes: _btnSkip,
      },
      {
        text: "Back",
        action: tour.back,
        classes: _btnClass,
      },
      {
        text: "Next",
        action: tour.next,
        classes: _btnClass,
      },
    ],
  });

  tour.addStep({
    attachTo: { element: "#btnHelpCenter", on: "top" },
    title: "Help Center",
    text:
      "Access training documents, FAQs and initialize in-app guided tours",
    buttons: [
      {
        text: "Cancel Tour",
        action: tour.cancel,
        classes: _btnSkip,
      },
      {
        text: "Back",
        action: tour.back,
        classes: _btnClass,
      },
      {
        text: "Next",
        action: tour.next,
        classes: _btnClass,
      },
    ],
  });

  tour.addStep({
    attachTo: { element: "#notifs", on: "top" },
    title: "Notifications",
    text:
      "Get notified with updates in collaboration comments, business drivers and snapshot.",
    classes: "example-step-extra-class",
    buttons: [
      {
        text: "Cancel Tour",
        action: tour.cancel,
        classes: _btnSkip,
      },
      {
        text: "Back",
        action: tour.back,
        classes: _btnClass,
      },
      {
        text: "Next",
        action: tour.next,
        classes: _btnClass,
      },
    ],
  });

  tour.addStep({
    attachTo: { element: "#switchTheme", on: "top" },
    title: "Theme",
    text: "Toggle between normal and dark mode.",
    buttons: [
      {
        text: "Cancel Tour",
        action: tour.cancel,
        classes: _btnSkip,
      },
      {
        text: "Back",
        action: tour.back,
        classes: _btnClass,
      },
      {
        text: "Next",
        action: tour.next,
        classes: _btnClass,
      },
    ],
  });

  if (userInfo.IsAdmin){
    tour.addStep({
        attachTo: { element: ".app-drawer", on: "top" },
        title: "Admin Panel",
        text: "Switch back to home page, access admin console and content management system. <br/><br/>This is where admin configures user security mapping, register Power BI content and monitor system resources.",
        buttons: [
          {
            text: "Cancel Tour",
            action: tour.cancel,
            classes: _btnSkip,
          },
          {
            text: "Back",
            action: tour.back,
            classes: _btnClass,
          },
          {
            text: "Next",
            action: tour.next,
            classes: _btnClass,
          },
        ],
      });
  }

  tour.addStep({
    title: "You're all set!",
    text: "",
    classes: "example-step-extra-class",
    buttons: [
      {
        text: "Got it. Thanks!",
        action: tour.next,
        classes: _btnClass,
      },
    ],
  });

  return { tour, q };
}

export function useDashboardTour(userInfo, q) {
  const mainStore = useMainStore();
  const tour = useShepherd({
    classPrefix: _classPrefix,
    useModalOverlay: true,
  });

  tour.on("cancel", () => {
    mainStore.SetAdHocTour(false);
    q.cookies.set("xmap_apptour_dashboard", "0", { expires: 360 });
  });

  tour.on("complete", () => {
    mainStore.SetAdHocTour(false);
    q.cookies.set("xmap_apptour_dashboard", "1", { expires: 360 });
  });

  // tour.addStep({
  //   title: "Getting Started: Report Viewer",
  //   text: "Take a quick guided tour to get familiar with XMAP Report Viewer",
  //   buttons: [
  //     {
  //       text: "No, thanks",
  //       action: tour.cancel,
  //       classes: _btnClass,
  //     },
  //     {
  //       text: "OK, let's start!",
  //       action: tour.next,
  //       classes: _btnClass,
  //     },
  //   ],
  // });

  tour.addStep({
    attachTo: { element: "#pbiframe", on: "top" },
    title: "Report Viewer",
    text: "Displays the Power BI content based on the selected filters.",
    buttons: [
      {
        text: "Cancel Tour",
        action: tour.cancel,
        classes: _btnSkip,
      },
      {
        text: "Back",
        action: tour.back,
        classes: _btnClass,
      },
      {
        text: "Next",
        action: tour.next,
        classes: _btnClass,
      },
    ],
  });  

  tour.addStep({
    attachTo: { element: "#dashboardFilterBar", on: "top" },
    title: "Data Filters",
    text:
      "Select applicable data filters -- some reports may have extra filters. Click on the button to select values (multiple selection is allowed in some parameters). <br/><br/>To <b>remove</b> a filter, click on the X icon.",
    buttons: [
      {
        text: "Cancel Tour",
        action: tour.cancel,
        classes: _btnSkip,
      },
      {
        text: "Back",
        action: tour.back,
        classes: _btnClass,
      },
      {
        text: "Next",
        action: tour.next,
        classes: _btnClass,
      },
    ],
  });

  if (!userInfo.IsAdmin){
    tour.addStep({
        attachTo: { element: "#dbBtnHome", on: "top" },
        title: "Home",
        text: "Switch back to home page to select other reports",
        buttons: [
          {
            text: "Cancel Tour",
            action: tour.cancel,
            classes: _btnSkip,
          },
          {
            text: "Back",
            action: tour.back,
            classes: _btnClass,
          },
          {
            text: "Next",
            action: tour.next,
            classes: _btnClass,
          },
        ],
      });
  }

  tour.addStep({
    attachTo: { element: "#dataModeIndicator", on: "top" },
    title: "Data Mode",
    text:
      "Indicates whether you're viewing the <b>live</b> or a <b>snapshot</b> (historical) data.",
    buttons: [
      {
        text: "Cancel Tour",
        action: tour.cancel,
        classes: _btnSkip,
      },
      {
        text: "Back",
        action: tour.back,
        classes: _btnClass,
      },
      {
        text: "Next",
        action: tour.next,
        classes: _btnClass,
      },
    ],
  });

  tour.addStep({
    attachTo: { element: "#btnShowSnapshot", on: "top" },
    title: "Data Mode Switch",
    text: "Switch between live or historical data view",
    buttons: [
      {
        text: "Cancel Tour",
        action: tour.cancel,
        classes: _btnSkip,
      },
      {
        text: "Back",
        action: tour.back,
        classes: _btnClass,
      },
      {
        text: "Next",
        action: tour.next,
        classes: _btnClass,
      },
    ],
  });

  if (userInfo.AnalyticsEditor) {
    tour.addStep({
      attachTo: { element: "#btnShowBusinessDriver", on: "top" },
      title: "Business Driver",
      text:
        "Show or hide the Business Driver panel which contains the analytical comments of the current report being viewed.",
      buttons: [
        {
          text: "Cancel Tour",
          action: tour.cancel,
          classes: _btnSkip,
        },
        {
          text: "Back",
          action: tour.back,
          classes: _btnClass,
        },
        {
          text: "Next",
          action: tour.next,
          classes: _btnClass,
        },
      ],
    });
  }

  if (userInfo.CollabEditor) {
    tour.addStep({
      attachTo: { element: "#btnShowCollab", on: "top" },
      title: "Collaboration",
      text:
        "Show or hide the Collaboration panel which contains comments from users who has access to the report currently viewed.",
      buttons: [
        {
          text: "Cancel Tour",
          action: tour.cancel,
          classes: _btnSkip,
        },
        {
          text: "Back",
          action: tour.back,
          classes: _btnClass,
        },
        {
          text: "Next",
          action: tour.next,
          classes: _btnClass,
        },
      ],
    });
  }

  tour.addStep({
    attachTo: { element: "#btnFullscreen", on: "top" },
    title: "Fullscreen View",
    text: "Toggle between fullscreen view of the report.",
    buttons: [
      {
        text: "Cancel Tour",
        action: tour.cancel,
        classes: _btnSkip,
      },
      {
        text: "Back",
        action: tour.back,
        classes: _btnClass,
      },
      {
        text: "Next",
        action: tour.next,
        classes: _btnClass,
      },
    ],
  });

  tour.addStep({
    title: "You're all set!",
    text: "",
    buttons: [
      {
        text: "Got it. Thanks!",
        action: tour.next,
        classes: _btnClass,
      },
    ],
  });

  return { tour, q };
}
