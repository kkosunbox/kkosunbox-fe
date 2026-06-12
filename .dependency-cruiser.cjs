/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-features-to-widgets",
      comment: "FSD: features must not import widgets",
      severity: "error",
      from: { path: "^features/" },
      to: { path: "^widgets/" },
    },
    {
      name: "no-entities-to-widgets",
      comment: "FSD: entities must not import widgets",
      severity: "error",
      from: { path: "^entities/" },
      to: { path: "^widgets/" },
    },
    {
      name: "no-shared-to-widgets",
      comment: "FSD: shared must not import widgets",
      severity: "error",
      from: { path: "^shared/" },
      to: { path: "^widgets/" },
    },
    {
      name: "no-widgets-to-app",
      comment: "FSD: widgets must not import app",
      severity: "error",
      from: { path: "^widgets/" },
      to: { path: "^app/" },
    },
    {
      name: "no-entities-to-features",
      comment: "FSD: entities must not import features (verified 0 violations on 2026-06-12)",
      severity: "error",
      from: { path: "^entities/" },
      to: { path: "^features/" },
    },
    {
      name: "package-plans-is-leaf",
      comment: "widgets/package-plans is a shared leaf widget — it must not import other widgets",
      severity: "error",
      from: { path: "^widgets/package-plans/" },
      to: { path: "^widgets/(?!package-plans)" },
    },

    {
      name: "widget-mypage-subscribe-coupling",
      severity: "warn",
      from: { path: "^widgets/mypage/" },
      to: { path: "^widgets/subscribe/" },
    },
    {
      name: "widget-order-subscribe-coupling",
      severity: "warn",
      from: { path: "^widgets/order/" },
      to: { path: "^widgets/subscribe/" },
    },
    {
      name: "widget-forgot-password-register-coupling",
      severity: "warn",
      from: { path: "^widgets/forgot-password/" },
      to: { path: "^widgets/register/" },
    },
    {
      name: "widget-inquiry-support-coupling",
      severity: "warn",
      from: { path: "^widgets/inquiry/" },
      to: { path: "^widgets/support/" },
    },
    {
      name: "widget-subscribe-support-coupling",
      severity: "warn",
      from: { path: "^widgets/subscribe/" },
      to: { path: "^widgets/support/" },
    },
  ],
  options: {
    doNotFollow: {
      path: ["node_modules", "\\.next"],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
