
import { BaseActionRegistry } from "./aiActions/BaseActionRegistry";
import { calendarActions } from "./aiActions/calendarActions";
import { complianceActions } from "./aiActions/complianceActions";
import { taxActions } from "./aiActions/taxActions";
import { documentActions } from "./aiActions/documentActions";
import { navigationActions } from "./aiActions/navigationActions";
import { analyticsActions } from "./aiActions/analyticsActions";
import { workflowActions } from "./aiActions/workflowActions";
import { automationActions } from "./aiActions/automationActions";
import { integrationActions } from "./aiActions/integrationActions";

class AIActionRegistry extends BaseActionRegistry {
  constructor() {
    super();
    this.registerAllActions();
  }

  private registerAllActions() {
    // Register calendar actions
    calendarActions.forEach(action => this.register(action));
    
    // Register compliance actions
    complianceActions.forEach(action => this.register(action));
    
    // Register tax actions
    taxActions.forEach(action => this.register(action));
    
    // Register document actions
    documentActions.forEach(action => this.register(action));
    
    // Register navigation actions
    navigationActions.forEach(action => this.register(action));
    
    // Register analytics actions
    analyticsActions.forEach(action => this.register(action));

    // Register workflow actions
    workflowActions.forEach(action => this.register(action));

    // Register Phase 4: automation actions
    automationActions.forEach(action => this.register(action));

    // Register Phase 4: integration actions
    integrationActions.forEach(action => this.register(action));
  }
}

export const actionRegistry = new AIActionRegistry();
