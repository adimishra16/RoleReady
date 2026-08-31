/** RoleReady Clerk UI — email/password only; phone fields hidden. */
export const clerkAppearance = {
  layout: {
    socialButtonsPlacement: "bottom" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#0f766e",
    colorTextOnPrimaryBackground: "#ffffff",
    borderRadius: "0.5rem",
    fontFamily: "IBM Plex Sans, Segoe UI, sans-serif",
  },
  elements: {
    formButtonPrimary:
      "bg-teal-800 hover:bg-teal-900 text-sm normal-case font-medium shadow-sm",
    card: "shadow-sm border border-border rounded-lg",
    headerTitle: "font-semibold tracking-tight font-display",
    headerSubtitle: "text-muted-foreground text-sm",
    formFieldRow__phoneNumber: { display: "none" },
    formFieldLabel__phoneNumber: { display: "none" },
    formFieldInput__phoneNumber: { display: "none" },
    formFieldAction__phoneNumber: { display: "none" },
    phoneInputBox: { display: "none" },
    identityPreviewEditButton__phoneNumber: { display: "none" },
  },
};
