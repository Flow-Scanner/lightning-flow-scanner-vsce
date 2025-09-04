import {
  IRulesConfig,
  getRules,
  AdvancedRule,
} from 'lightning-flow-scanner-core';
import * as vsce from 'vscode';
import { Document, parse } from 'yaml';

type Configuration = {
  fspath: string;
  config: unknown;
};

export class ConfigProvider {
  public async discover(configPath: string): Promise<Configuration> {
    const configurationName = 'flow-scanner';

    const findInJson = [`.${configPath}.json`, `${configurationName}.json`];

    const findInYml = [
      `.${configurationName}.yml`,
      `.${configurationName}.yaml`,
      `${configurationName}.yaml`,
      `${configurationName}.yml`,
      configurationName,
    ];

    let configFile = await this.attemptToReadConfig(
      configPath,
      findInJson,
      JSON.parse
    );

    if (!configFile) {
      configFile = await this.attemptToReadConfig(configPath, findInYml, parse);
    }

    if (!configFile) {
      // if at this point there's still nothing. create a new file
      configFile = await this.writeConfigFile(configurationName, configPath);
    }

    return configFile;
  }

  private async writeConfigFile(
    configurationName: string,
    configPath: string
  ): Promise<Configuration> {
    const allRules: Record<string, { severity: string }> = [
      ...getRules(),
    ].reduce(
      (acc, rule: AdvancedRule) => {
        acc[rule.name] = { severity: 'error' };
        return acc;
      },
      {} as Record<string, { severity: string }>
    );

    const config = {
      rules: allRules,
    };

    const configFile = {
      fspath: `${configPath}/.${configurationName}.yml`,
      config,
    };

    await vsce.workspace.fs.writeFile(
      vsce.Uri.file(configFile.fspath),
      new TextEncoder().encode(String(new Document(config)))
    );

    return configFile;
  }

  private async attemptToReadConfig(
    basePath: string,
    potentialFileNames: string[],
    parser: Function
  ): Promise<Configuration | null> {
    let foundConfig: Configuration;
    await Promise.all(
      potentialFileNames.map(async (fileName) => {
        if (foundConfig) return;
        const file = vsce.Uri.file(`${basePath}/${fileName}`);
        try {
          const doesFileExist = await vsce.workspace.fs.stat(file);
          if (doesFileExist) {
            foundConfig = { fspath: file.fsPath, config: undefined };
            const fileContent = Buffer.from(
              await vsce.workspace.fs.readFile(file)
            ).toString();
            foundConfig.config = parser(fileContent);
          }
        } catch (e) {
          // File does not exist, ignore
        }
      })
    );
    return foundConfig;
  }

  public async loadConfig(configPath?: string): Promise<IRulesConfig> {
    const explorerResults = await this.discover(configPath);
    return explorerResults?.config ?? {};
  }
}
