/** RoleReady Clerk UI — email/password only; phone fields hidden. */
export const clerkAppearance = {
  layout: {
    socialButtonsPlacement: "bottom" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#0f766e",
    colorTextOnPrimaryBackground: "#ffffff",
    borderRadius: "0.75rem",
  },
  elements: {
    formButtonPrimary:
      "bg-teal-700 hover:bg-teal-800 text-sm normal-case shadow-sm",
    card: "shadow-lg border border-border",
    headerTitle: "font-bold tracking-tight",
    headerSubtitle: "text-muted-foreground",
    // Hide phone number fields / toggle if Clerk still exposes them
    formFieldRow__phoneNumber: { display: "none" },
    formFieldLabel__phoneNumber: { display: "none" },
    formFieldInput__phoneNumber: { display: "none" },
    formFieldAction__phoneNumber: { display: "none" },
    phoneInputBox: { display: "none" },
    identityPreviewEditButton__phoneNumber: { display: "none" },
  },
};
