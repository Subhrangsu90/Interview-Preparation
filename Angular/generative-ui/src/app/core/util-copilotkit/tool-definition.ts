import { type FrontendToolConfig } from '@copilotkit/angular';

export function createFrontendTool<Args extends Record<string, unknown>>(tool: FrontendToolConfig<Args>): FrontendToolConfig<Args> {
    return tool;
}