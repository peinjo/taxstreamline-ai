
import { complianceAutomationActions } from "./complianceAutomationActions";
import { clientOnboardingActions } from "./clientOnboardingActions";
import { recurringTaskActions } from "./recurringTaskActions";

export const automationActions = [
  ...complianceAutomationActions,
  ...clientOnboardingActions,
  ...recurringTaskActions
];
