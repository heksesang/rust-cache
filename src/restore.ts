import * as cache from "@actions/cache";
import * as core from "@actions/core";
import { cleanTarget, getCacheConfig, getPackages, stateKey } from "./common";

async function run() {
  try {
    core.exportVariable("CARGO_INCREMENTAL", 0);

    const { paths, key, restoreKeys } = await getCacheConfig();

    core.info(`Restoring paths:\n    ${paths.join("\n    ")}`);
    core.info(`In directory:\n    ${process.cwd()}`);
    core.info(`Using keys:\n    ${[key, ...restoreKeys].join("\n    ")}`);
    const restoreKey = await cache.restoreCache(paths, key, restoreKeys);
    if (restoreKey) {
      core.info(`Restored from cache key "${restoreKey}".`);
      core.saveState(stateKey, restoreKey);

      if (restoreKey !== key) {
        // pre-clean the target directory on cache mismatch
        const packages = await getPackages();

        await cleanTarget(packages);
      }
    } else {
      core.info("No cache found.");
    }
  } catch (e) {
    core.info(`[warning] ${e.message}`);
  }
}

run();
