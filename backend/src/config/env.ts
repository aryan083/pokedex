
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const resolveEnvPathCandidates = (appEnv: string): string[] => {
  const filename = `.env.${appEnv}.config`;

  return [
    path.resolve(__dirname, '../../../configs/envs', filename),
    path.resolve(__dirname, '../../configs/envs', filename),
    path.resolve(process.cwd(), 'configs', 'envs', filename),
  ];
};

const loadEnv = (): void => {
  const appEnv = process.env.APP_ENV || 'local';
  const candidates = resolveEnvPathCandidates(appEnv);
  const selected = candidates.find((candidate) => fs.existsSync(candidate));

  if (selected) {
    dotenv.config({ path: selected });
    return;
  }

  dotenv.config();
};

loadEnv();
