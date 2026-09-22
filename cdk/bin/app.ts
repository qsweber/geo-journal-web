import { App } from "aws-cdk-lib";
import { GeoJournalWebStack } from "../lib/stack";
import { EnvConfig } from "../lib/config";
import devConfig from "../config/dev.json";
import productionConfig from "../config/production.json";

const app = new App();

function deploy(id: string, cfg: EnvConfig) {
  new GeoJournalWebStack(app, id, cfg, {
    env: {
      account: cfg.account,
      region: cfg.region,
    },
  });
}

deploy("geo-journal-web-dev", devConfig as EnvConfig);
deploy("geo-journal-web-production", productionConfig as EnvConfig);
